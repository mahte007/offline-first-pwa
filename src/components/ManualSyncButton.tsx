'use client';
import { useState } from 'react';

export default function ManualSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState('');

  async function handleSync() {
    if (!('serviceWorker' in navigator)) return alert('No SW available');

    setSyncing(true);
    setStatus('Starting sync...');

    const registration = await navigator.serviceWorker.ready;
    try {
      await registration.sync.register('sync-queued-requests');
      setStatus('✅ Sync registered successfully!');
    } catch (err) {
      console.error('[Client] Manual sync failed:', err);
      setStatus('⚠️ Manual sync failed');
    }

    setSyncing(false);
  }

  return (
    <div className="flex flex-col items-center mt-4">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 disabled:opacity-50"
      >
        {syncing ? 'Syncing...' : '🔄 Sync Now'}
      </button>
      {status && <p className="text-sm mt-2">{status}</p>}
    </div>
  );
}
