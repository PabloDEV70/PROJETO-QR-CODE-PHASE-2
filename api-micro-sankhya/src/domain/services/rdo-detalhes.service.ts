import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlDate } from '../../shared/sql-sanitize';
import {
  ListRdoDetalhesOptions,
  RdoDetalhePeriodo,
  RdoDetalhesResponse,
} from '../../types/AD_RDOAPONTAMENTOS';
import {
  parseIncludeExclude,
  buildFilterSql,
} from '../../shared/utils/filter-parser';
import * as Q from '../../sql-queries/AD_RDOAPONTAMENTOS';

export class RdoDetalhesService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getDetalhesPorPeriodo(
    options: ListRdoDetalhesOptions,
  ): Promise<RdoDetalhesResponse> {
    const {
      page,
      limit,
      orderBy = 'DTREF',
      orderDir = 'DESC',
    } = options;
    const offset = (page - 1) * limit;

    const whereSql = this.buildWhere(options);
    const orderSql = this.buildOrderBy(orderBy, orderDir);

    const countSql = Q.detalhesPorPeriodoCount.replace('-- @WHERE', whereSql);

    const dataSql = Q.detalhesPorPeriodo
      .replace('-- @WHERE', whereSql)
      .replace('-- @ORDER', orderSql)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    const [countResult, data] = await Promise.all([
      this.queryExecutor.executeQuery<{
        totalRegistros: number;
        totalMinutos: number;
        totalHoras: number;
      }>(countSql),
      this.queryExecutor.executeQuery<RdoDetalhePeriodo>(dataSql),
    ]);

    const totals = countResult[0] || {
      totalRegistros: 0,
      totalMinutos: 0,
      totalHoras: 0,
    };

    return {
      data,
      meta: {
        page,
        limit,
        totalRegistros: totals.totalRegistros,
        totalMinutos: totals.totalMinutos,
        totalHoras: totals.totalHoras,
      },
    };
  }

  private buildWhere(options: ListRdoDetalhesOptions): string {
    const {
      dataInicio,
      dataFim,
      codparc,
      rdomotivocod,
      comOs,
      semOs,
      coddep,
      codcargo,
      codfuncao,
      codemp,
    } = options;

    const conditions: string[] = [];

    if (dataInicio) {
      conditions.push(`rdo.DTREF >= ${escapeSqlDate(dataInicio)}`);
    }
    if (dataFim) {
      conditions.push(`rdo.DTREF <= ${escapeSqlDate(dataFim)}`);
    }

    this.applyFilter(conditions, codparc, 'rdo.CODPARC');
    this.applyFilter(conditions, rdomotivocod, 'det.RDOMOTIVOCOD');
    this.applyFilter(conditions, coddep, 'fun.CODDEP');
    this.applyFilter(conditions, codcargo, 'fun.CODCARGO');
    this.applyFilter(conditions, codfuncao, 'fun.CODFUNCAO');
    this.applyFilter(conditions, codemp, 'fun.CODEMP');

    if (comOs === true) {
      conditions.push('det.NUOS IS NOT NULL');
    }
    if (semOs === true) {
      conditions.push('det.NUOS IS NULL');
    }

    return conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
  }

  private applyFilter(
    conditions: string[],
    raw: string | undefined,
    column: string,
  ): void {
    if (!raw) return;
    const filter = parseIncludeExclude(raw);
    const sql = buildFilterSql(column, filter);
    if (sql) conditions.push(sql);
  }

  private buildOrderBy(orderBy: string, orderDir: string): string {
    const allowedSorts: Record<string, string> = {
      DTREF: 'rdo.DTREF',
      CODRDO: 'rdo.CODRDO',
      ITEM: 'det.ITEM',
      HRINI: 'det.HRINI',
      CODPARC: 'rdo.CODPARC',
      CODDEP: 'fun.CODDEP',
      CODCARGO: 'fun.CODCARGO',
    };
    const safeCol = allowedSorts[orderBy] || 'rdo.DTREF';
    return `${safeCol} ${orderDir}, det.CODRDO, det.ITEM`;
  }
}
