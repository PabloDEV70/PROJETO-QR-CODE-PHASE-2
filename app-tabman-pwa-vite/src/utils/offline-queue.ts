import { apiClient } from '@/api/client';

export type QueueItemStatus = 'pending' | 'syncing' | 'failed';

export interface QueuedMutation {
  id: string;
  method: 'post' | 'put' | 'delete';
  url: string;
  data?: unknown;
  timestamp: number;
  status: QueueItemStatus;
  retries: number;
  lastError?: string;
}

const DB_NAME = 'tabman-offline';
const STORE_NAME = 'mutations';
const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 1000;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putItem(db: IDBDatabase, item: QueuedMutation): Promise<void> {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(item);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteItem(db: IDBDatabase, id: string): Promise<void> {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function enqueue(
  method: string,
  url: string,
  data?: unknown,
): Promise<void> {
  const db = await openDb();
  const item: QueuedMutation = {
    method: method as QueuedMutation['method'],
    url,
    data,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    status: 'pending',
    retries: 0,
  };
  await putItem(db, item);
}

export async function getAll(): Promise<QueuedMutation[]> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const req = tx.objectStore(STORE_NAME).getAll();
  return new Promise((resolve) => {
    req.onsuccess = () => {
      const items = (req.result as QueuedMutation[]).sort(
        (a, b) => a.timestamp - b.timestamp,
      );
      resolve(items);
    };
    req.onerror = () => resolve([]);
  });
}

export async function getQueueSize(): Promise<number> {
  const items = await getAll();
  return items.filter(
    (i) => i.status === 'pending' || i.status === 'syncing',
  ).length;
}

export async function clearQueue(): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function flushQueue(): Promise<number> {
  const db = await openDb();
  const items = await getAll();
  const pending = items.filter(
    (i) => i.status === 'pending' || i.status === 'syncing',
  );

  if (pending.length === 0) return 0;

  let ok = 0;

  for (const item of pending) {
    item.status = 'syncing';
    await putItem(db, item);

    let success = false;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        await delay(BACKOFF_BASE_MS * Math.pow(2, attempt - 1));
      }
      try {
        await apiClient({
          method: item.method,
          url: item.url,
          data: item.data,
        });
        success = true;
        break;
      } catch (err) {
        item.retries = attempt + 1;
        item.lastError =
          err instanceof Error ? err.message : 'Erro desconhecido';
      }
    }

    if (success) {
      await deleteItem(db, item.id);
      ok++;
    } else {
      item.status = 'failed';
      await putItem(db, item);
    }
  }

  return ok;
}

// Auto-flush when back online
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (flushTimeout) clearTimeout(flushTimeout);
    flushTimeout = setTimeout(async () => {
      const flushed = await flushQueue();
      if (flushed > 0) {
        const { useNotificationStore } = await import(
          '@/stores/notification-store'
        );
        useNotificationStore
          .getState()
          .addToast('success', `${flushed} registro(s) sincronizado(s)`);
      }
    }, 1500);
  });
}
