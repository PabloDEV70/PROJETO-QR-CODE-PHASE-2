import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString } from '../../shared/sql-sanitize';
import { ContratoCompleto, ListContratosOptions } from '../../types/AD_CONTRATOS';
import * as Q from '../../sql-queries/AD_CONTRATOS';

export class ContratosService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getById(id: number): Promise<ContratoCompleto | null> {
    const sql = Q.buscarPorId.replace('@id', id.toString());
    const rows = await this.queryExecutor.executeQuery<ContratoCompleto>(sql);
    return rows[0] || null;
  }

  async search(term: string): Promise<ContratoCompleto[]> {
    const sanitizedTerm = escapeSqlString(term);
    const sql = Q.pesquisar.replace(/@sanitizedTerm/g, sanitizedTerm);
    return this.queryExecutor.executeQuery<ContratoCompleto>(sql);
  }

  async list(options: ListContratosOptions): Promise<ContratoCompleto[]> {
    const { page, limit, status, codparc, orderBy = 'DHINIC', orderDir = 'DESC' } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    if (status) {
      if (status === 'vigente') {
        conditions.push('GETDATE() BETWEEN c.DHINIC AND c.DHFIN');
      } else if (status === 'futuro') {
        conditions.push('c.DHINIC > GETDATE()');
      } else if (status === 'encerrado') {
        conditions.push('c.DHFIN < GETDATE()');
      }
    }
    if (codparc) {
      conditions.push(`c.CODPARC = ${codparc}`);
    }

    const whereSql = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    const allowedSorts = ['DHINIC', 'DHFIN', 'ID'];
    const safeOrderBy = allowedSorts.includes(orderBy) ? `c.${orderBy}` : 'c.DHINIC';
    const orderSql = `${safeOrderBy} ${orderDir}`;

    const sql = Q.listar
      .replace('-- @WHERE', whereSql)
      .replace('-- @ORDER', orderSql)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    return this.queryExecutor.executeQuery<ContratoCompleto>(sql);
  }

  async getByVeiculo(
    codveiculo: number,
    page: number = 1,
    limit: number = 50,
  ): Promise<ContratoCompleto[]> {
    const offset = (page - 1) * limit;
    const sql = Q.porVeiculo
      .replace('@codveiculo', codveiculo.toString())
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    return this.queryExecutor.executeQuery<ContratoCompleto>(sql);
  }

  async getByParceiro(
    codparc: number,
    page: number = 1,
    limit: number = 50,
  ): Promise<ContratoCompleto[]> {
    const offset = (page - 1) * limit;
    const sql = Q.porParceiro
      .replace('@codparc', codparc.toString())
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    return this.queryExecutor.executeQuery<ContratoCompleto>(sql);
  }

  async getVigentes(page: number = 1, limit: number = 50): Promise<ContratoCompleto[]> {
    const offset = (page - 1) * limit;
    const sql = Q.vigentes
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    return this.queryExecutor.executeQuery<ContratoCompleto>(sql);
  }
}
