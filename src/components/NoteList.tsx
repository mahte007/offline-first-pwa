/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { clearNotes, getAllNotes, saveNoteLocally } from '../db/indexedDB';

export default function NoteList({ refresh }: { refresh: boolean }) {
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    async function loadNotes() {
      try {
        if (navigator.onLine) {
          const res = await fetch('/api/notes');
          const apiNotes = await res.json();

          await clearNotes();
          for (const note of apiNotes) {
            await saveNoteLocally(note);
          }

          setNotes(apiNotes);
        } else {
          const localNotes = await getAllNotes();
          setNotes(localNotes);
        }
      } catch (err) {
        console.error('Failed to load notes:', err);
        const localNotes = await getAllNotes();
        setNotes(localNotes);
      }
    }

    loadNotes();
  }, [refresh]);

  return (
    <ul className="p-4">
      {notes.map((note) => (
        <li key={note.date} className="border-b py-2">
          {note.text} <span className="text-xs text-gray-500">({note.date})</span>
        </li>
      ))}
    </ul>
  );
}
