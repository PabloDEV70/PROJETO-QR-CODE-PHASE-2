import { AsyncLocalStorage } from 'async_hooks';
import { createHmac } from 'crypto';

export type DatabaseName = 'PROD' | 'TESTE' | 'TREINA';

export interface UserInfo {
  codusu: number | null;
  username: string | null;
}

const storage = new AsyncLocalStorage<DatabaseName>();
const userTokenStorage = new AsyncLocalStorage<string>();
const userInfoStorage = new AsyncLocalStorage<UserInfo>();

export const VALID_DATABASES: DatabaseName[] = ['PROD', 'TESTE', 'TREINA'];

export function getDatabase(): DatabaseName {
  return storage.getStore() ?? 'PROD';
}

export function enterDatabase(db: DatabaseName): void {
  storage.enterWith(db);
}

export function getUserToken(): string | undefined {
  return userTokenStorage.getStore();
}

export function enterUserToken(token: string): void {
  userTokenStorage.enterWith(token);
}

export function getUserInfo(): UserInfo {
  return userInfoStorage.getStore() ?? { codusu: null, username: null };
}

export function enterUserInfo(info: UserInfo): void {
  userInfoStorage.enterWith(info);
}

function base64UrlDecode(str: string): string {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf-8');
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Decode JWT payload without verification (fallback when no secret configured).
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}

/**
 * Verify JWT HMAC-SHA256 signature and check expiry. Falls back to decode-only if no secret.
 */
export function verifyJwt(token: string, secret: string | undefined): Record<string, unknown> | null {
  if (!secret) {
    return decodeJwtPayload(token);
  }
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Verify signature (HS256)
    const signatureInput = `${parts[0]}.${parts[1]}`;
    const expectedSig = base64UrlEncode(
      createHmac('sha256', secret).update(signatureInput).digest(),
    );
    if (expectedSig !== parts[2]) return null;

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;

    // Check expiry
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
