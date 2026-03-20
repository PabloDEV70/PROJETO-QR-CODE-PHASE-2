import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { ChatListItem } from '@/types/chamados-types';

const STORAGE_KEY = 'chamado-read-timestamps';

function getStore(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function setStore(store: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
}

// For useSyncExternalStore
let storeSnapshot = getStore();

function subscribe(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      storeSnapshot = getStore();
      callback();
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

function getSnapshot() {
  return storeSnapshot;
}

export function useChatUnread(items: ChatListItem[]) {
  const store = useSyncExternalStore(subscribe, getSnapshot);

  const markAsRead = useCallback((nuchamado: number) => {
    const current = getStore();
    current[String(nuchamado)] = new Date().toISOString();
    setStore(current);
    storeSnapshot = current;
  }, []);

  const isUnread = useCallback((item: ChatListItem): boolean => {
    if (!item.ULTIMA_ATIVIDADE) return false;
    const readAt = store[String(item.NUCHAMADO)];
    if (!readAt) return true;
    return item.ULTIMA_ATIVIDADE > readAt;
  }, [store]);

  const unreadCount = useMemo(
    () => items.filter(isUnread).length,
    [items, isUnread],
  );

  return { markAsRead, isUnread, unreadCount };
}
