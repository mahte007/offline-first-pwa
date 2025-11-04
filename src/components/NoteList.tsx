/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { getAllNotes } from '../db/indexedDB';

export default function NoteList({ refresh }: { refresh: boolean }) {
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setNotes(await getAllNotes());
    })();
  }, [refresh]);

  return (
    <ul className="p-4">
      {notes.map((note) => (
        <li key={note.id} className="border-b py-2">
          {note.text} <span className="text-xs text-gray-500">({note.date})</span>
        </li>
      ))}
    </ul>
  );
}
