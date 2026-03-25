import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { logger } from '../../shared/logger';
import * as Q from '../../sql-queries/TGFCAB';
import type {
  NotaDetalheCab,
  NotaDetalheItem,
  NotaDetalheTop,
  NotaDetalheVar,
  NotaDetalheCompleta,
} from '../../types/TGFCAB';

export class NotaDetalheService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  private async safeQuery<T>(name: string, sql: string): Promise<T[]> {
    try {
      const rows = await this.qe.executeQuery<T>(sql);
      logger.info('[NotaDetalhe] %s OK: %d rows | sql_len=%d', name, rows.length, sql.length);
      return rows;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const axErr = err as { response?: { status?: number; data?: unknown } };
      const motherStatus = axErr?.response?.status;
      const motherBody = axErr?.response?.data ? JSON.stringify(axErr.response.data).substring(0, 200) : '';
      logger.error('[NotaDetalhe] QUERY FAILED: %s | sql_len=%d | motherStatus=%s | motherBody=%s | first150=%s',
        name, sql.length, motherStatus, motherBody, sql.substring(0, 150));
      throw new Error(`Query ${name} failed: ${msg}`);
    }
  }

  async getDetalhe(nunota: number): Promise<NotaDetalheCompleta | null> {
    const nu = String(nunota);
    const cabSql = Q.notaDetalheCab.replace(/@nunota/g, nu);
    const itensSql = Q.notaDetalheItens.replace(/@nunota/g, nu);
    const topSql = Q.notaDetalheTop.replace(/@nunota/g, nu);
    const varSql = Q.notaDetalheVar.replace(/@nunota/g, nu);

    logger.info('[NotaDetalhe] Fetching NUNOTA=%s cab=%d itens=%d top=%d var=%d chars',
      nu, cabSql.length, itensSql.length, topSql.length, varSql.length);

    const [cabRows, itens, topRows, variacoes] = await Promise.all([
      this.safeQuery<NotaDetalheCab>('CAB', cabSql),
      this.safeQuery<NotaDetalheItem>('ITENS', itensSql),
      this.safeQuery<NotaDetalheTop>('TOP', topSql),
      this.safeQuery<NotaDetalheVar>('VAR', varSql),
    ]);

    if (!cabRows[0]) {
      logger.warn('[NotaDetalhe] No CAB data for NUNOTA=%s', nu);
      return null;
    }

    return {
      cabecalho: cabRows[0],
      itens,
      top: topRows[0] || null,
      variacoes,
    };
  }
}
