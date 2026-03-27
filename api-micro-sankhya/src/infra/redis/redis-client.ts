import Redis from 'ioredis';
import { env } from '@/config/env';

let client: Redis | null = null;

export function getRedisClient(): Redis | null {
  return client;
}

export async function initRedis(): Promise<void> {
  if (!env.REDIS_URL) {
    console.log('[Redis] REDIS_URL not set — tracking disabled');
    return;
  }

  try {
    client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
      lazyConnect: true,
    });
    await client.connect();
    console.log('[Redis] Connected');
  } catch (err) {
    console.warn('[Redis] Connection failed:', err);
    client = null;
  }
}

export async function closeRedis(): Promise<void> {
  if (client) {
    try { await client.quit(); } catch { /* ignore */ }
    client = null;
  }
}
