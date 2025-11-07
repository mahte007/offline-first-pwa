// global.d.ts
interface SyncManager {
  register(tag: string): Promise<void>;
}

interface ServiceWorkerRegistration {
  sync: SyncManager;
}
