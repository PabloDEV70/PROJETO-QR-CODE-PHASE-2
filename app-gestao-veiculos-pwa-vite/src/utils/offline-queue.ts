import { apiClient } from '@/api/client';

export type QueueItemStatus = 'pending' | 'syncing' | 'failed';

export interface QueuedMutation {
  id: string;
  method: 'post' | 'put' | 'delete' | 'patch';
  url: string;
  data?: unknown;
  timestamp: number;
  status: QueueItemStatus;
  retries: number;
  lastError?: string;
}

const DB_NAME = 'gestao-veiculos-offline';
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

export async function enqueue(mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'status' | 'retries'>): Promise<void> {
  const db = await openDb();
  const item: QueuedMutation = {
    ...mutation,
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
      const items = (req.result as QueuedMutation[]).sort((a, b) => a.timestamp - b.timestamp);
      resolve(items);
    };
    req.onerror = () => resolve([]);
  });
}

export async function getPendingCount(): Promise<number> {
  const items = await getAll();
  return items.filter((i) => i.status === 'pending' || i.status === 'syncing').length;
}

export async function getFailedCount(): Promise<number> {
  const items = await getAll();
  return items.filter((i) => i.status === 'failed').length;
}

export async function remove(id: string): Promise<void> {
  const db = await openDb();
  await deleteItem(db, id);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let _onFlushCallback: ((ok: number) => void) | null = null;

export function setOnFlushCallback(cb: (ok: number) => void): void {
  _onFlushCallback = cb;
}

export async function flushQueue(): Promise<{ ok: number; failed: number }> {
  const db = await openDb();
  const items = await getAll();
  const pending = items.filter((i) => i.status === 'pending' || i.status === 'syncing');

  if (pending.length === 0) return { ok: 0, failed: 0 };

  let ok = 0;
  let failed = 0;

  for (const item of pending) {
    item.status = 'syncing';
    await putItem(db, item);

    let success = false;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0) await delay(BACKOFF_BASE_MS * Math.pow(2, attempt - 1));
      try {
        await apiClient({ method: item.method, url: item.url, data: item.data });
        success = true;
        break;
      } catch (err) {
        item.retries = attempt + 1;
        item.lastError = err instanceof Error ? err.message : 'Erro desconhecido';
      }
    }

    if (success) {
      await deleteItem(db, item.id);
      ok++;
    } else {
      item.status = 'failed';
      await putItem(db, item);
      failed++;
    }
  }

  if (ok > 0 && _onFlushCallback) {
    _onFlushCallback(ok);
  }

  return { ok, failed };
}

export async function retryFailed(): Promise<{ ok: number; failed: number }> {
  const db = await openDb();
  const items = await getAll();
  const failedItems = items.filter((i) => i.status === 'failed');

  for (const item of failedItems) {
    item.status = 'pending';
    item.retries = 0;
    await putItem(db, item);
  }

  return flushQueue();
}

let flushTimeout: ReturnType<typeof setTimeout> | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (flushTimeout) clearTimeout(flushTimeout);
    flushTimeout = setTimeout(async () => {
      const { ok } = await flushQueue();
      if (ok > 0) {
        const { useNotificationStore } = await import('@/stores/notification-store');
        useNotificationStore.getState().addToast('success', `${ok} situacao(oes) sincronizada(s)`);
      }
    }, 1500);
  });
}
