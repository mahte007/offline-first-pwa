/* eslint-disable @typescript-eslint/no-explicit-any */
import { openDB } from "idb";

const DB_NAME = "offline-notes-db";
const STORE_NAME = "notes";
const OUTBOX_STORE = "outbox";

export async function initDB() {
  return openDB(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        db.createObjectStore(OUTBOX_STORE, {
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

export async function addToOutBox(req: any) {
  const db = await initDB();
  await db.add(OUTBOX_STORE, req);
}

export async function getOutbox() {
  const db = await initDB();
  return db.getAll(OUTBOX_STORE);
}

export async function clearOutbox() {
  const db = await initDB();
  await db.clear(OUTBOX_STORE);
}
