import { apiMotherClient } from '../../infra/api-mother/client';
import { DbQueryResult } from '../../types/DB_QUERY';

/**
 * Unwrap API Mother double-wrapped envelope.
 * Axios response.data = { data: { success, data: {actual}, metadata } }
 */
function unwrap(responseData: unknown): unknown {
  let d = responseData;
  if (d && typeof d === 'object' && 'data' in d) {
    d = (d as Record<string, unknown>).data;
  }
  if (d && typeof d === 'object' && 'data' in d) {
    d = (d as Record<string, unknown>).data;
  }
  return d;
}

export class DbQueryService {
  /**
   * Execute a SELECT query via API Mother /inspection/query.
   * STRICT: Only SELECT/WITH allowed — validated here AND by API Mother.
   */
  async executeQuery(sql: string): Promise<DbQueryResult> {
    let cleanSql = sql.trim();
    cleanSql = cleanSql.replace(/^--.*$/gm, '').trim();
    cleanSql = cleanSql.replace(/\/\*[\s\S]*?\*\//g, '').trim();

    if (cleanSql.length > 10_000) {
      throw new Error('SECURITY: Query exceeds maximum length (10000 chars).');
    }

    const upper = cleanSql.toUpperCase();

    const forbidden = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE',
      'TRUNCATE', 'EXEC', 'EXECUTE', 'GRANT', 'REVOKE', 'MERGE', 'BULK',
      'OPENROWSET', 'OPENDATASOURCE', 'XP_', 'SP_'];
    for (const word of forbidden) {
      if (upper.includes(word)) {
        throw new Error(`SECURITY: Forbidden keyword "${word}" detected.`);
      }
    }

    if (!upper.startsWith('SELECT') && !upper.startsWith('WITH')) {
      throw new Error('SECURITY: Only SELECT or WITH queries are allowed.');
    }

    const response = await apiMotherClient.post('/inspection/query', {
      query: cleanSql,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inner = unwrap(response.data) as any;
    return {
      linhas: inner?.data ?? inner?.dados ?? inner?.linhas ?? [],
      quantidadeLinhas: inner?.rowCount ?? inner?.quantidadeLinhas ?? 0,
      tempoExecucaoMs: inner?.tempoExecucaoMs ?? 0,
    };
  }
}
