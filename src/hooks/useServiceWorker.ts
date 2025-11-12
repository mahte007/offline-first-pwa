import { markNoteAsSynced } from "@/db/indexedDB";
import { useEffect } from "react";

export default function useServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("[SW] Registered", reg.scope))
          .catch((err) => console.error("[SW] Registration failed", err));
      });
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "SYNC_COMPLETE") {
          alert("✅ Offline notes have been synced successfully!");
        }
      });
      navigator.serviceWorker.addEventListener("message", async (event) => {
        if (event.data?.type === "NOTE_SYNCED") {
          const { id } = event.data;
          await markNoteAsSynced(id);
        }
      });
    }
  }, []);
}
