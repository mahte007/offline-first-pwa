'use client';
import { useState } from 'react';
import { saveNoteLocally } from '../db/indexedDB';

export default function NoteForm({ onAdd }: { onAdd: () => void }) {
  const [text, setText] = useState('');

  const handleAdd = async () => {
    if (!text.trim()) return;

    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, date: new Date().toISOString() }),
    });

    await saveNoteLocally({
      id: crypto.randomUUID(),
      text,
      date: new Date().toISOString(),
    });

    setText('');
    onAdd();
  };

  return (
    <div className="p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Írj egy jegyzetet..."
        className="border p-2 w-full rounded"
      />
      <button
        onClick={handleAdd}
        className="bg-blue-500 text-white px-3 py-1 mt-2 rounded"
      >
        Hozzáadás
      </button>
    </div>
  );
}
