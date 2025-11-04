import { openDB } from "idb";

const DB_NAME = "offline-notes-db";
const STORE_NAME = "notes";

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
}

export async function saveNoteLocally(note: { text: string; date: string }) {
  const db = await initDB();
  await db.add(STORE_NAME, note);
}

export async function getAllNotes() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function clearNotes() {
  const db = await initDB();
  await db.clear(STORE_NAME);
}
