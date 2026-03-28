import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '../../config/env';
import { logger } from '../../shared/logger';
import { getDatabase, getUserToken } from './database-context';
import { isDev, R, B, D, YELLOW, RED, GREEN, CYAN, clock, msText, devLog } from '../../shared/log-colors';

// ---------------------------------------------------------------------------
// Concurrency limiter — prevents flooding API Mother with parallel requests
// ---------------------------------------------------------------------------
const MAX_CONCURRENT = 8;
let activeCount = 0;
const queue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (activeCount < MAX_CONCURRENT) {
    activeCount++;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => queue.push(() => { activeCount++; resolve(); }));
}

function releaseSlot() {
  activeCount--;
  if (queue.length > 0) {
    const next = queue.shift()!;
    next();
  }
}

export const apiMotherClient: AxiosInstance = axios.create({
  baseURL: env.API_MAE_BASE_URL,
  timeout: 30000,
});

// Attach user token + database + timing metadata to every request
// Also enforce concurrency limit to avoid API Mother 429
apiMotherClient.interceptors.request.use(async (config) => {
  await acquireSlot();
  const cfg = config as ConfigWithMeta;
  cfg._startTime = Date.now();
  cfg._hasSlot = true;

  const userToken = getUserToken();
  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
    // Check if JWT is expired (basic decode without verification)
    try {
      const payload = JSON.parse(Buffer.from(userToken.split('.')[1], 'base64').toString());
      const exp = payload.exp;
      if (exp && exp * 1000 < Date.now()) {
        logger.error('[ApiMotherClient] TOKEN EXPIRADO! exp=%s now=%s user=%s — request vai falhar com 401',
          new Date(exp * 1000).toISOString(), new Date().toISOString(), payload.username || payload.sub);
      }
    } catch { /* ignore decode errors */ }
  } else {
    logger.error('[ApiMotherClient] SEM TOKEN! Nenhum user token no contexto — request vai falhar com 401. URL=%s', config.url);
  }

  const database = getDatabase();
  config.headers['x-database'] = database;
  config.headers['X-Database'] = database;
  config.headers['X-DATABASE'] = database;

  if (env.NETWORK_BYPASS_KEY) {
    config.headers['X-Network-Bypass-Key'] = env.NETWORK_BYPASS_KEY;
  }

  return config;
});

type ConfigWithMeta = InternalAxiosRequestConfig & {
  _startTime?: number;
  _hasSlot?: boolean;
};

// ---------------------------------------------------------------------------
// Retry on 429 (rate limit) with exponential backoff
// ---------------------------------------------------------------------------
type ConfigWithRetry = ConfigWithMeta & { _retryCount?: number };
const MAX_429_RETRIES = 4;
const BASE_429_DELAY_MS = 1500;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Response Interceptor: timing + error logging + 429 retry + slot release
apiMotherClient.interceptors.response.use(
  (response) => {
    const cfg = response.config as ConfigWithMeta;
    if (cfg._hasSlot) { releaseSlot(); cfg._hasSlot = false; }

    const t0 = cfg._startTime;
    const ms = t0 ? Date.now() - t0 : -1;
    const url = response.config.url || '?';
    const method = (response.config.method || 'get').toUpperCase();

    if (ms > 5000) {
      devLog(`${clock()}  ${D}├─${R} ${YELLOW}${B}SLOW${R} ${D}API Mother${R} ${CYAN}${method}${R} ${url} ${msText(ms)}`);
      if (!isDev) logger.warn('[ApiMother] SLOW %s %s | %dms | status=%d', method, url, ms, response.status);
    } else if (isDev) {
      devLog(`${clock()}  ${D}├─${R} ${GREEN}✓${R} ${D}API Mother${R} ${CYAN}${method}${R} ${D}${url}${R} ${msText(ms)}`);
    } else {
      logger.debug('[ApiMother] OK %s %s | %dms', method, url, ms);
    }
    return response;
  },
  async (error: AxiosError) => {
    const cfg = error.config as ConfigWithRetry | undefined;

    // Release slot before retry/reject
    if (cfg?._hasSlot) { releaseSlot(); cfg._hasSlot = false; }

    const t0 = cfg?._startTime;
    const ms = t0 ? Date.now() - t0 : -1;
    const url = cfg?.url || '?';
    const method = (cfg?.method || 'get').toUpperCase();
    const status = error.response?.status ?? 'N/A';

    // Auto-retry on 429 with exponential backoff (re-acquires slot on retry)
    if (status === 429 && cfg) {
      const retries = cfg._retryCount ?? 0;
      if (retries < MAX_429_RETRIES) {
        cfg._retryCount = retries + 1;
        const waitMs = BASE_429_DELAY_MS * Math.pow(2, retries);
        devLog(`${clock()}  ${D}├─${R} ${YELLOW}⟳${R} ${D}API Mother${R} ${YELLOW}429${R} ${url} retry ${retries + 1}/${MAX_429_RETRIES} in ${waitMs}ms`);
        logger.warn('[ApiMother] 429 on %s — retry %d/%d in %dms', url, retries + 1, MAX_429_RETRIES, waitMs);
        await delay(waitMs);
        return apiMotherClient(cfg);
      }
      logger.error('[ApiMother] 429 on %s — max retries exhausted', url);
    }

    const respBody = error.response?.data ? JSON.stringify(error.response.data).substring(0, 300) : 'no body';
    devLog(`${clock()}  ${D}├─${R} ${RED}✗${R} ${D}API Mother${R} ${RED}${status}${R} ${CYAN}${method}${R} ${url} ${msText(ms < 0 ? 0 : ms)}`);
    if (status === 400) {
      logger.error('[ApiMother] VALIDATION FAIL %s %s | %dms | body=%s', method, url, ms, respBody);
    } else if (status === 401) {
      logger.error('[ApiMother] AUTH FAIL (token expirado ou invalido) %s %s | %dms', method, url, ms);
    } else {
      logger.error('[ApiMother] FAIL %s %s | %dms | status=%s | %s', method, url, ms, status, error.message);
    }
    return Promise.reject(error);
  },
);
