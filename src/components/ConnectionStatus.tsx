'use client';
import { useEffect, useState } from 'react';

export default function ConnectionStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (online) return null;

  return (
    <div className="bg-yellow-400 text-black text-center py-2 text-sm fixed top-0 w-full z-50">
      ⚠️ You’re offline — your notes will sync when back online.
    </div>
  );
}
