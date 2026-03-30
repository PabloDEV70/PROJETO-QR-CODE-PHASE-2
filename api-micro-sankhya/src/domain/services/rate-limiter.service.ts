import { env } from '@/config/env';
import { getRedisClient } from '@/infra/redis/redis-client';

const maxAttempts = env.RATE_LIMIT_MAX_ATTEMPTS;
const windowSec = env.RATE_LIMIT_WINDOW_MINUTES * 60;

function getKey(identifier: string, ip: string): string {
  return `ratelimit:${identifier}:${ip}`;
}

// --- In-memory fallback ---
interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

const memAttempts = new Map<string, AttemptRecord>();
const MAX_MEM_ENTRIES = 10_000;
const windowMs = windowSec * 1000;
const lockoutMs = windowMs;

function memCheckLimit(key: string): number | null {
  const record = memAttempts.get(key);
  if (!record) return null;
  const now = Date.now();
  if (record.lockedUntil && now < record.lockedUntil) {
    return Math.ceil((record.lockedUntil - now) / 1000);
  }
  if (now - record.firstAttempt > windowMs) {
    memAttempts.delete(key);
    return null;
  }
  if (record.count < maxAttempts) return null;
  record.lockedUntil = now + lockoutMs;
  return Math.ceil(lockoutMs / 1000);
}

function memRecordFailure(key: string): void {
  const now = Date.now();
  const record = memAttempts.get(key);
  if (!record || now - record.firstAttempt > windowMs) {
    if (memAttempts.size >= MAX_MEM_ENTRIES) memCleanup();
    memAttempts.set(key, { count: 1, firstAttempt: now, lockedUntil: null });
    return;
  }
  record.count++;
  if (record.count >= maxAttempts) {
    record.lockedUntil = now + lockoutMs;
  }
}

function memRecordSuccess(key: string): void {
  memAttempts.delete(key);
}

function memCleanup(): void {
  const now = Date.now();
  for (const [k, record] of memAttempts) {
    const expired = record.lockedUntil ? now > record.lockedUntil : now - record.firstAttempt > windowMs;
    if (expired) memAttempts.delete(k);
  }
}

// --- Redis implementation ---

/**
 * Returns null if allowed, or seconds remaining until unlocked.
 */
export async function checkLimit(identifier: string, ip: string): Promise<number | null> {
  const key = getKey(identifier, ip);
  const redis = getRedisClient();
  if (!redis) return memCheckLimit(key);

  try {
    const lockKey = `${key}:lock`;
    const lockTtl = await redis.ttl(lockKey);
    if (lockTtl > 0) return lockTtl;

    const count = await redis.get(key);
    if (!count) return null;
    if (Number(count) < maxAttempts) return null;

    // At limit - set lock
    await redis.set(lockKey, '1', 'EX', windowSec);
    return windowSec;
  } catch {
    return memCheckLimit(key);
  }
}

export async function recordFailure(identifier: string, ip: string): Promise<void> {
  const key = getKey(identifier, ip);
  const redis = getRedisClient();
  if (!redis) { memRecordFailure(key); return; }

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSec);
    }
    if (count >= maxAttempts) {
      await redis.set(`${key}:lock`, '1', 'EX', windowSec);
    }
  } catch {
    memRecordFailure(key);
  }
}

export async function recordSuccess(identifier: string, ip: string): Promise<void> {
  const key = getKey(identifier, ip);
  const redis = getRedisClient();
  if (!redis) { memRecordSuccess(key); return; }

  try {
    await redis.del(key, `${key}:lock`);
  } catch {
    memRecordSuccess(key);
  }
}

export function cleanup(): void {
  memCleanup();
}
