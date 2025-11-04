import { useEffect } from 'react';

export default function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => console.log('[SW] Registered', reg.scope))
          .catch((err) => console.error('[SW] Registration failed', err));
      });
    }
  }, []);
}
