import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import * as Q from '../../sql-queries/TCFOSCAB';
import type { OsListItem, OsResumo, OsColabServico, OsListOptions } from '../../types/TCFOSCAB';
import { cache, CACHE_TTL } from '../../shared/cache';
import { escapeSqlString } from '../../shared/sql-sanitize';

export class OsListService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async list(opts: OsListOptions) {
    const ck = `os:list:${JSON.stringify(opts)}`;
    const cached = cache.get<{ data: OsListItem[]; pagination: unknown }>(ck);
    if (cached) return cached;

    const page = opts.page ?? 1;
    const limit = opts.limit ?? 30;
    const offset = (page - 1) * limit;
    const where = this.buildWhere(opts);

    const listSql = Q.osList
      .replace('-- @WHERE', where)
      .replace(/@OFFSET/g, String(offset))
      .replace(/@LIMIT/g, String(limit));

    const countSql = Q.osListCount.replace('-- @WHERE', where);

    const [items, countResult] = await Promise.all([
      this.qe.executeQuery<OsListItem>(listSql),
      this.qe.executeQuery<{ total: number }>(countSql),
    ]);

    const total = countResult[0]?.total ?? 0;

    const result = {
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
    cache.set(ck, result, CACHE_TTL.RDO_LIST);
    return result;
  }

  /**
   * Optimized: fetches all active OS (A + E) in a single query.
   * Eliminates the N+1 count subquery via pre-aggregated JOIN.
   * Supports placa search and codparcexec filter.
   */
  async listAtivas(opts: {
    codparcexec?: string;
    placa?: string;
  }) {
    const ck = `os:ativas:${opts.codparcexec ?? ''}:${opts.placa ?? ''}`;
    const cached = cache.get<OsListItem[]>(ck);
    if (cached) return cached;

    const parts: string[] = [];
    if (opts.codparcexec) {
      parts.push(
        `AND EXISTS (SELECT 1 FROM TCFSERVOS s2 INNER JOIN TCFSERVOSATO a2` +
        ` ON s2.NUOS = a2.NUOS AND s2.SEQUENCIA = a2.SEQUENCIA` +
        ` INNER JOIN TSIUSU u2 ON a2.CODEXEC = u2.CODUSU` +
        ` WHERE s2.NUOS = os.NUOS AND u2.CODPARC = ${parseInt(opts.codparcexec, 10)})`,
      );
    }
    if (opts.placa) {
      const safe = escapeSqlString(opts.placa.replace(/[%_[\]]/g, ''));
      parts.push(`AND v.PLACA LIKE '%${safe}%'`);
    }

    const sql = Q.osListAtivas.replace('-- @WHERE', parts.join('\n'));
    const rows = await this.qe.executeQuery<OsListItem>(sql);
    cache.set(ck, rows, CACHE_TTL.RDO_LIST);
    return rows;
  }

  async getResumo(opts: OsListOptions) {
    const where = this.buildWhere(opts);
    const sql = Q.osResumo.replace('-- @WHERE', where);
    const rows = await this.qe.executeQuery<OsResumo>(sql);
    return rows[0] ?? {
      totalOs: 0,
      abertas: 0,
      emExecucao: 0,
      fechadas: 0,
      canceladas: 0,
      veiculosAtendidos: 0,
    };
  }

  async getColabServicos(opts: {
    codusu?: string; codparc?: string;
    dataInicio?: string; dataFim?: string;
  }) {
    const whereParts: string[] = [];
    if (opts.dataInicio) {
      whereParts.push(`AND os.DTABERTURA >= '${this.esc(opts.dataInicio)}'`);
    }
    if (opts.dataFim) {
      whereParts.push(`AND os.DTABERTURA <= '${this.esc(opts.dataFim)} 23:59:59'`);
    }

    let execFilter = '';
    if (opts.codusu) {
      execFilter = `AND ato.CODEXEC = ${parseInt(opts.codusu, 10)}`;
    } else if (opts.codparc) {
      execFilter = `AND uexec.CODPARC = ${parseInt(opts.codparc, 10)}`;
    }

    const sql = Q.osColabServicos
      .replace('-- @EXEC_FILTER', execFilter)
      .replace('-- @WHERE', whereParts.join('\n'));
    return this.qe.executeQuery<OsColabServico>(sql);
  }

  private buildWhere(opts: OsListOptions): string {
    const parts: string[] = [];
    if (opts.dataInicio) {
      parts.push(`AND os.DTABERTURA >= '${this.esc(opts.dataInicio)}'`);
    }
    if (opts.dataFim) {
      parts.push(`AND os.DTABERTURA <= '${this.esc(opts.dataFim)} 23:59:59'`);
    }
    if (opts.codveiculo) {
      parts.push(`AND os.CODVEICULO = ${parseInt(opts.codveiculo, 10)}`);
    }
    if (opts.status) {
      parts.push(`AND os.STATUS = '${this.esc(opts.status)}'`);
    }
    if (opts.tipo) {
      parts.push(`AND os.TIPO = '${this.esc(opts.tipo)}'`);
    }
    if (opts.manutencao) {
      parts.push(`AND os.MANUTENCAO = '${this.esc(opts.manutencao)}'`);
    }
    if (opts.codusuexec) {
      parts.push(
        `AND EXISTS (SELECT 1 FROM TCFSERVOS s2 INNER JOIN TCFSERVOSATO a2` +
        ` ON s2.NUOS = a2.NUOS AND s2.SEQUENCIA = a2.SEQUENCIA` +
        ` WHERE s2.NUOS = os.NUOS AND a2.CODEXEC = ${parseInt(opts.codusuexec, 10)})`,
      );
    }
    if (opts.codparcexec) {
      parts.push(
        `AND EXISTS (SELECT 1 FROM TCFSERVOS s2 INNER JOIN TCFSERVOSATO a2` +
        ` ON s2.NUOS = a2.NUOS AND s2.SEQUENCIA = a2.SEQUENCIA` +
        ` INNER JOIN TSIUSU u2 ON a2.CODEXEC = u2.CODUSU` +
        ` WHERE s2.NUOS = os.NUOS AND u2.CODPARC = ${parseInt(opts.codparcexec, 10)})`,
      );
    }
    if (opts.statusGig) {
      parts.push(`AND os.AD_STATUSGIG = '${this.esc(opts.statusGig)}'`);
    }
    if (opts.search) {
      const safe = this.esc(opts.search).replace(/[%_[\]]/g, '');
      if (/^\d+$/.test(safe)) {
        parts.push(`AND os.NUOS = ${parseInt(safe, 10)}`);
      } else {
        parts.push(`AND (v.PLACA LIKE '%${safe}%' OR v.AD_TAG LIKE '%${safe}%')`);
      }
    }
    return parts.join('\n');
  }

  private esc(val: string): string {
    return escapeSqlString(val);
  }
}
