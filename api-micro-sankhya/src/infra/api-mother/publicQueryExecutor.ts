import axios from 'axios';
import { env } from '../../config/env';
import { logger } from '../../shared/logger';
import { getDatabase } from './database-context';

function sqlLabel(sql: string): string {
  const clean = sql.replace(/\s+/g, ' ').trim();
  const fromMatch = clean.match(/FROM\s+(\w+)/i);
  const table = fromMatch ? fromMatch[1] : '?';
  const type = clean.toUpperCase().startsWith('WITH') ? 'CTE' : 'SELECT';
  return `${type}:${table}`;
}

/**
 * Executes read-only SQL via API Mother's /query endpoint.
 * Uses API_MOTHER_PUBLIC_KEY as Bearer token (no user JWT needed).
 * For public pages only (e.g. armário público).
 */
export class PublicQueryExecutor {
  async executeQuery<T = Record<string, unknown>>(sql: string): Promise<T[]> {
    if (!env.API_MOTHER_PUBLIC_KEY) {
      throw new Error('API_MOTHER_PUBLIC_KEY not configured');
    }

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
    const t0 = Date.now();
    const database = getDatabase();

    try {
      logger.debug('[PublicQuery] START %s', label);
      const response = await axios.post(
        `${env.API_MAE_BASE_URL}/public-query`,
        { query: cleanSql },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': env.API_MOTHER_PUBLIC_KEY,
            'X-Database': database,
            ...(env.NETWORK_BYPASS_KEY && { 'X-Network-Bypass-Key': env.NETWORK_BYPASS_KEY }),
          },
          timeout: 30000,
        },
      );
      const elapsed = Date.now() - t0;

      // Response: { data: { data: [...], success, meta } }
      let rows = response.data?.data;
      if (rows && !Array.isArray(rows) && typeof rows === 'object') {
        rows = rows.data ?? rows.dados ?? rows.linhas ?? [];
      }
      if (!Array.isArray(rows)) {
        rows = [];
      }

      const rowCount = rows.length;
      if (elapsed > 2000) {
        logger.warn('[PublicQuery] SLOW %s | %dms | %d rows', label, elapsed, rowCount);
      } else {
        logger.info('[PublicQuery] OK %s | %dms | %d rows', label, elapsed, rowCount);
      }
      return rows;
    } catch (error: unknown) {
      const elapsed = Date.now() - t0;
      const msg = error instanceof Error ? error.message : String(error);
      const status = (error as { response?: { status?: number } })?.response?.status;
      logger.error(
        { err: msg, status, sql: cleanSql.slice(0, 500) },
        '[PublicQuery] FAIL %s | %dms | status=%s', label, elapsed, status,
      );
      throw error;
    }
  }
}
