const CACHE_VERSION = "v3";
const CACHE_NAME = `offline-cache-${CACHE_VERSION}`;
const QUEUE_DB = "offline-queue";
const OFFLINE_URL = "/offline.html";

// -------- INSTALLATION --------
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/", "/offline.html", "/manifest.webmanifest"]);
    })
  );
  self.skipWaiting();
});

// -------- ACTIVATION --------
self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(
            (key) => key.startsWith("offline-cache-") && key !== CACHE_NAME
          )
          .map((key) => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// -------- FETCH HANDLING --------
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Handle API POSTs with background sync
  if (req.method === "POST" && req.url.includes("/api/")) {
    event.respondWith(
      fetch(req.clone()).catch(() => {
        console.warn("[SW] Offline — queueing request for sync");
        queueRequest(req);
        return new Response(
          JSON.stringify({ message: "Saved locally. Will sync when online." }),
          { headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // Network-first for all other requests
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() =>
        caches.match(req).then((r) => r || caches.match(OFFLINE_URL))
      )
  );
});

// -------- BACKGROUND SYNC --------
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-queued-requests") {
    console.log("[SW] Sync event triggered");
    event.waitUntil(sendQueuedRequests());
  }
});

// -------- QUEUE FUNCTIONS --------
function queueRequest(request) {
  const data = {
    url: request.url,
    method: request.method,
    headers: [...request.headers],
  };
  request
    .clone()
    .text()
    .then((body) => {
      data.body = body;
      saveToQueue(data);
      self.registration.sync.register("sync-queued-requests");
    });
}

function saveToQueue(entry) {
  const openReq = indexedDB.open(QUEUE_DB, 1);

  openReq.onupgradeneeded = () => {
    const db = openReq.result;
    if (!db.objectStoreNames.contains("queue")) {
      db.createObjectStore("queue", { keyPath: "id", autoIncrement: true });
    }
  };

  openReq.onsuccess = () => {
    const db = openReq.result;
    const tx = db.transaction("queue", "readwrite");
    const store = tx.objectStore("queue");
    store.add(entry);
  };

  openReq.onerror = (e) => {
    console.error("[SW] Failed to open queue DB:", e);
  };
}

async function openQueue() {
  return new Promise((resolve, reject) => {
    const openReq = indexedDB.open(QUEUE_DB, 1);
    openReq.onupgradeneeded = () => {
      const db = openReq.result;
      if (!db.objectStoreNames.contains("queue")) {
        db.createObjectStore("queue", { keyPath: "id", autoIncrement: true });
      }
    };
    openReq.onsuccess = () => resolve(openReq.result);
    openReq.onerror = (e) => reject(e);
  });
}

async function sendQueuedRequests() {
  try {
    const db = await openQueue();
    const tx = db.transaction("queue", "readwrite");
    const store = tx.objectStore("queue");

    const all = await new Promise((resolve, reject) => {
      const getReq = store.getAll();
      getReq.onsuccess = () => resolve(getReq.result || []);
      getReq.onerror = reject;
    });

    if (!all || all.length === 0) {
      console.log("[SW] Queue is empty");
      return;
    }

    for (const req of all) {
      try {
        console.log("[SW] Resending queued request:", req.url);
        await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: req.body,
        });
      } catch (err) {
        console.warn("[SW] Failed to resend request:", err);
        continue; // keep it in queue if it fails again
      }
    }

    // Clear queue after successful resend
    const tx2 = db.transaction("queue", "readwrite");
    const store2 = tx2.objectStore("queue");

    await new Promise((resolve, reject) => {
      const clearReq = store2.clear();
      clearReq.onsuccess = () => {
        console.log("[SW] Queue cleared after sync");
        resolve();
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) =>
            client.postMessage({ type: "SYNC_COMPLETE" })
          );
        });
      };
      clearReq.onerror = reject;
    });

    db.close();

    console.log("[SW] Queue cleared after sync");
  } catch (err) {
    console.error("[SW] Error sending queued requests:", err);
  }
}
