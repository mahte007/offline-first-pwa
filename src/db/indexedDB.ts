/* eslint-disable @typescript-eslint/no-explicit-any */
import { openDB } from "idb";

const DB_NAME = "offline-notes-db";
const NOTES_STORE = "notes";
const OUTBOX_STORE = "outbox";

export interface Note {
  id: string;
  text: string;
  date: string;
  synced: boolean;
}

export async function initDB() {
  return openDB(DB_NAME, 3, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        db.createObjectStore(NOTES_STORE, {
          keyPath: "id",
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

export async function saveNoteLocally(note: Omit<Note, "synced">) {
  const db = await initDB();
  const fullNote: Note = { ...note, synced: navigator.onLine };
  await db.put(NOTES_STORE, fullNote);
}

export async function markNoteAsSynced(id: string) {
  const db = await initDB();
  const note = await db.get(NOTES_STORE, id);
  if (note) {
    note.synced = true;
    await db.put(NOTES_STORE, note);
  }
  console.log(note)
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await initDB();
  return db.getAll(NOTES_STORE);
}

export async function clearNotes() {
  const db = await initDB();
  await db.clear(NOTES_STORE);
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
