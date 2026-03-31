import { env } from '@/config/env';

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

const attempts = new Map<string, AttemptRecord>();
const MAX_ENTRIES = 10_000;

const maxAttempts = env.RATE_LIMIT_MAX_ATTEMPTS;
const windowMs = env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
const lockoutMs = env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;

function getKey(identifier: string, ip: string): string {
  return `${identifier}:${ip}`;
}

/**
 * Returns null if allowed, or seconds remaining until unlocked.
 */
export function checkLimit(identifier: string, ip: string): number | null {
  const key = getKey(identifier, ip);
  const record = attempts.get(key);
  if (!record) return null;

  const now = Date.now();

  // Check lockout
  if (record.lockedUntil && now < record.lockedUntil) {
    return Math.ceil((record.lockedUntil - now) / 1000);
  }

  // Window expired — reset
  if (now - record.firstAttempt > windowMs) {
    attempts.delete(key);
    return null;
  }

  // Under limit
  if (record.count < maxAttempts) return null;

  // At limit — lock now
  record.lockedUntil = now + lockoutMs;
  return Math.ceil(lockoutMs / 1000);
}

export function recordFailure(identifier: string, ip: string): void {
  const key = getKey(identifier, ip);
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now - record.firstAttempt > windowMs) {
    // Evict oldest entries if at capacity
    if (attempts.size >= MAX_ENTRIES) {
      cleanup();
      if (attempts.size >= MAX_ENTRIES) {
        const firstKey = attempts.keys().next().value;
        if (firstKey) attempts.delete(firstKey);
      }
    }
    attempts.set(key, { count: 1, firstAttempt: now, lockedUntil: null });
    return;
  }

  record.count++;
  if (record.count >= maxAttempts) {
    record.lockedUntil = now + lockoutMs;
  }
}

export function recordSuccess(identifier: string, ip: string): void {
  attempts.delete(getKey(identifier, ip));
}

export function cleanup(): void {
  const now = Date.now();
  for (const [key, record] of attempts) {
    const expired = record.lockedUntil
      ? now > record.lockedUntil
      : now - record.firstAttempt > windowMs;
    if (expired) attempts.delete(key);
  }
}
