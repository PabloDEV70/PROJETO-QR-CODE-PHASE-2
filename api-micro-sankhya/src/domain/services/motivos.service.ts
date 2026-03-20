import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { AdRdoMotivos } from '../../types/AD_RDOMOTIVOS';
import * as Q from '../../sql-queries/AD_RDOMOTIVOS';
import { escapeSqlString, escapeSqlDate } from '../../shared/sql-sanitize';

export interface ListMotivosOptions {
  page: number;
  limit: number;
  ativo?: 'S' | 'N';
  dataInicio?: string;
  dataFim?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

export class MotivosService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  private buildRdoCountWhere(dataInicio?: string, dataFim?: string): string {
    const conditions: string[] = [];
    if (dataInicio) {
      conditions.push(`a.DTREF >= '${escapeSqlDate(dataInicio)}'`);
    }
    if (dataFim) {
      conditions.push(`a.DTREF <= '${escapeSqlDate(dataFim)}'`);
    }
    return conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
  }

  async getById(id: number): Promise<AdRdoMotivos | null> {
    const sql = Q.buscarPorId.replace('@id', id.toString());
    const rows = await this.queryExecutor.executeQuery<AdRdoMotivos>(sql);
    return rows[0] || null;
  }

  async search(term: string, dataInicio?: string, dataFim?: string): Promise<AdRdoMotivos[]> {
    const sanitizedTerm = escapeSqlString(term);
    const rdoCountWhere = this.buildRdoCountWhere(dataInicio, dataFim);
    const sql = Q.pesquisar
      .replace(/@sanitizedTerm/g, sanitizedTerm)
      .replace('-- @RDOCOUNT_WHERE', rdoCountWhere);
    return this.queryExecutor.executeQuery<AdRdoMotivos>(sql);
  }

  async list(options: ListMotivosOptions): Promise<AdRdoMotivos[]> {
    const {
      page, limit, ativo, dataInicio, dataFim,
      orderBy = 'DESCRICAO', orderDir = 'ASC',
    } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    if (ativo) {
      conditions.push(`m.ATIVO = '${ativo}'`);
    }

    const whereSql = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
    const rdoCountWhere = this.buildRdoCountWhere(dataInicio, dataFim);

    const allowedSorts = ['DESCRICAO', 'SIGLA', 'DTINC', 'rdoCount'];
    const safeOrderBy = allowedSorts.includes(orderBy)
      ? (orderBy === 'rdoCount' ? 'rdoCount' : `m.${orderBy}`)
      : 'm.DESCRICAO';
    const orderSql = `${safeOrderBy} ${orderDir}`;

    const sql = Q.listar
      .replace('-- @WHERE', whereSql)
      .replace('-- @RDOCOUNT_WHERE', rdoCountWhere)
      .replace('-- @ORDER', orderSql)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    return this.queryExecutor.executeQuery<AdRdoMotivos>(sql);
  }
}
