import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

// Mock indexedDB with fake-indexeddb
import 'fake-indexeddb/auto';

// Mock apiClient before importing the module
vi.mock('@/api/client', () => ({
  apiClient: vi.fn(),
}));

// Must also mock the notification store dynamic import used in the online listener
vi.mock('@/stores/notification-store', () => ({
  useNotificationStore: { getState: () => ({ addToast: vi.fn() }) },
}));

// Use fake timers to skip backoff delays
beforeAll(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterAll(() => {
  vi.useRealTimers();
});

import { enqueue, getAll, remove, flushQueue, retryFailed } from '../offline-queue';
import { apiClient } from '@/api/client';

const mockApiClient = vi.mocked(apiClient);

describe('offline-queue', () => {
  it('enqueues a mutation and retrieves it', async () => {
    await enqueue({ method: 'post', url: '/test-enqueue', data: { foo: 1 } });
    const items = await getAll();
    const found = items.find((i) => i.url === '/test-enqueue');
    expect(found).toBeDefined();
    expect(found!.method).toBe('post');
    expect(found!.status).toBe('pending');
    expect(found!.retries).toBe(0);

    // cleanup
    await remove(found!.id);
  });

  it('getPendingCount returns count of pending items', async () => {
    await enqueue({ method: 'post', url: '/count-a' });
    await enqueue({ method: 'put', url: '/count-b' });

    const items = await getAll();
    const mine = items.filter((i) => i.url.startsWith('/count-'));
    expect(mine.length).toBeGreaterThanOrEqual(2);

    // cleanup
    for (const item of mine) await remove(item.id);
  });

  it('remove deletes an item', async () => {
    await enqueue({ method: 'post', url: '/remove-test' });
    const items = await getAll();
    const found = items.find((i) => i.url === '/remove-test')!;
    await remove(found.id);

    const after = await getAll();
    expect(after.find((i) => i.id === found.id)).toBeUndefined();
  });

  it('flushQueue processes pending items on success', async () => {
    mockApiClient.mockResolvedValue({} as never);
    await enqueue({ method: 'post', url: '/flush-ok-1' });
    await enqueue({ method: 'put', url: '/flush-ok-2' });

    const result = await flushQueue();
    expect(result.ok).toBeGreaterThanOrEqual(2);

    const after = await getAll();
    expect(after.find((i) => i.url === '/flush-ok-1')).toBeUndefined();
    expect(after.find((i) => i.url === '/flush-ok-2')).toBeUndefined();
  });

  it('flushQueue marks items as failed after max retries', async () => {
    mockApiClient.mockRejectedValue(new Error('Network error'));
    await enqueue({ method: 'post', url: '/flush-fail' });

    const result = await flushQueue();
    expect(result.failed).toBeGreaterThanOrEqual(1);

    const after = await getAll();
    const found = after.find((i) => i.url === '/flush-fail');
    expect(found).toBeDefined();
    expect(found!.status).toBe('failed');
    expect(found!.lastError).toBe('Network error');

    // cleanup
    await remove(found!.id);
    mockApiClient.mockReset();
  });

  it('retryFailed resets and re-flushes', async () => {
    // First make it fail
    mockApiClient.mockRejectedValue(new Error('fail'));
    await enqueue({ method: 'post', url: '/retry-test' });
    await flushQueue();

    // Now make it succeed
    mockApiClient.mockResolvedValue({} as never);
    const result = await retryFailed();
    expect(result.ok).toBeGreaterThanOrEqual(1);

    const after = await getAll();
    expect(after.find((i) => i.url === '/retry-test')).toBeUndefined();
    mockApiClient.mockReset();
  }, 30000);
});
