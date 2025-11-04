'use client';
import { useState } from 'react';
import NoteForm from '../components/NoteForm';
import NoteList from '../components/NoteList';

export default function Home() {
  const [refresh, setRefresh] = useState(false);

  return (
    <main className="max-w-md mx-auto mt-10 bg-white shadow p-4 rounded">
      <h1 className="text-2xl font-bold mb-4">Offline Jegyzet App (Next.js)</h1>
      <NoteForm onAdd={() => setRefresh(!refresh)} />
      <NoteList refresh={refresh} />
    </main>
  );
}
