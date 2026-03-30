import { AsyncLocalStorage } from 'async_hooks';
import jwt from 'jsonwebtoken';

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

/**
 * Decode JWT payload without verification (fallback when no secret configured).
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Verify JWT signature and return payload. Falls back to decode-only if no secret.
 */
export function verifyJwt(token: string, secret: string | undefined): Record<string, unknown> | null {
  if (!secret) {
    return decodeJwtPayload(token);
  }
  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (typeof payload === 'string') return null;
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}
