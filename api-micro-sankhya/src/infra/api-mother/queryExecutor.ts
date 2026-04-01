import { createHash } from 'node:crypto';
import { apiMotherClient } from './client';
import { logger } from '../../shared/logger';
import { isDev, R, B, D, GREEN, YELLOW, RED, CYAN, MAGENTA, clock, msText, devLog } from '../../shared/log-colors';

// Extract a short label from SQL for logging
function sqlLabel(sql: string): string {
  const clean = sql.replace(/\s+/g, ' ').trim();
  const fromMatch = clean.match(/FROM\s+(\w+)/i);
  const table = fromMatch ? fromMatch[1] : '?';
  const type = clean.toUpperCase().startsWith('WITH') ? 'CTE' : 'SELECT';
  return `${type}:${table}`;
}

// ---------------------------------------------------------------------------
// In-flight deduplication: identical SQL queries coalesce into one request
// ---------------------------------------------------------------------------
const inflight = new Map<string, Promise<unknown[]>>();

function sqlHash(sql: string): string {
  return createHash('md5').update(sql).digest('hex');
}

function parseRows(data: unknown): unknown[] {
  let rows = (data as { data?: unknown })?.data;
  if (rows && !Array.isArray(rows) && typeof rows === 'object') {
    rows = (rows as Record<string, unknown>).data
      ?? (rows as Record<string, unknown>).dados
      ?? (rows as Record<string, unknown>).linhas ?? [];
  }
  return Array.isArray(rows) ? rows : [];
}

export interface QueryOptions {
  timeout?: number;
}

export class QueryExecutor {
  /**
   * Executes a raw SQL SELECT query.
   * STRICT: Only SELECT is allowed.
   * Deduplicates identical in-flight queries (same SQL = same promise).
   */
  async executeQuery<T = Record<string, unknown>>(
    sql: string,
    options?: QueryOptions,
  ): Promise<T[]> {
    let cleanSql = sql.trim();
    cleanSql = cleanSql.replace(/^--.*$/gm, '').trim();
    cleanSql = cleanSql.replace(/\/\*[\s\S]*?\*\//g, '').trim();

    if (
      !cleanSql.toUpperCase().startsWith('SELECT') &&
      !cleanSql.toUpperCase().startsWith('WITH')
    ) {
      throw new Error('SECURITY VIOLATION: Only SELECT or WITH queries are allowed.');
    }

    const label = sqlLabel(cleanSql);
    const hash = sqlHash(cleanSql);

    // Deduplicate: if same query is already in flight, share the promise
    const existing = inflight.get(hash);
    if (existing) {
      devLog(`${clock()}  ${D}│  ${MAGENTA}⟐${R} ${D}DEDUP${R} ${CYAN}${label}${R}`);
      logger.debug('[QueryExecutor] DEDUP %s (reusing in-flight)', label);
      return existing as Promise<T[]>;
    }

    const t0 = Date.now();
    const axiosConfig = options?.timeout ? { timeout: options.timeout } : undefined;
    if (label.includes('TGFCAB') || label.includes('TGFTOP')) {
      logger.info('[QueryExecutor] DEBUG sending query to mother: length=%d first100=%s', cleanSql.length, cleanSql.substring(0,100));
    }
    const requestBody = { query: cleanSql, params: [] };
    if (label.includes('TGFCAB') || label.includes('TGFTOP')) {
      logger.info('[QueryExecutor] sending payload to mother: %o', { length: cleanSql.length, preview: cleanSql.substring(0, 200) });
    }

    const promise = apiMotherClient
      .post('/inspection/query', requestBody, axiosConfig)
      .then((response) => {
        const elapsed = Date.now() - t0;
        const rows = parseRows(response.data);
        const rowCount = `${D}${rows.length} rows${R}`;
        if (elapsed > 2000) {
          devLog(`${clock()}  ${D}│  ${YELLOW}${B}⚡${R} ${CYAN}${label}${R} ${msText(elapsed)} ${rowCount}`);
          if (!isDev) logger.warn('[QueryExecutor] SLOW %s | %dms | %d rows', label, elapsed, rows.length);
        } else if (isDev) {
          devLog(`${clock()}  ${D}│  ${GREEN}●${R} ${CYAN}${label}${R} ${msText(elapsed)} ${rowCount}`);
        } else {
          logger.debug('[QueryExecutor] OK %s | %dms | %d rows', label, elapsed, rows.length);
        }
        return rows;
      })
      .catch((error: unknown) => {
        const elapsed = Date.now() - t0;
        const msg = error instanceof Error ? error.message : String(error);
        const axiosData = (error as { response?: { data?: unknown } })?.response?.data;
        const status = (error as { response?: { status?: number } })?.response?.status;
        devLog(`${clock()}  ${D}│  ${RED}${B}✗${R} ${CYAN}${label}${R} ${RED}${status ?? 'ERR'}${R} ${msText(elapsed)} ${D}${msg.slice(0, 80)}${R}`);
        logger.error(
          { err: msg, status, responseData: axiosData, sql: cleanSql.slice(0, 500) },
          '[QueryExecutor] FAIL %s | %dms | status=%s', label, elapsed, status,
        );
        throw error;
      })
      .finally(() => {
        inflight.delete(hash);
      });

    inflight.set(hash, promise);
    return promise as Promise<T[]>;
  }
}
