'use client';
import { useState } from 'react';
import { saveNoteLocally } from '../db/indexedDB';

export default function NoteForm({ onAdd }: { onAdd: () => void }) {
  const [text, setText] = useState('');

  const handleAdd = async () => {
    if (!text.trim()) return;
    await saveNoteLocally({ text, date: new Date().toISOString() });
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
