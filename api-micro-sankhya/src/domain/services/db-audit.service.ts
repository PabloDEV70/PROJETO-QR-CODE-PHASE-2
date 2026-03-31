import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString } from '../../shared/sql-sanitize';
import {
  AuditoriaFilters, ListaAuditoria, EstatisticasAuditoria, RegistroAuditoria,
} from '../../types/DB_AUDIT';

const qe = new QueryExecutor();

export class DbAuditService {
  async getHistorico(filters: AuditoriaFilters): Promise<ListaAuditoria> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const offset = (page - 1) * limit;

    const where = this.buildWhere(filters);

    const countSql = `SELECT COUNT(*) AS total FROM AD_GIG_LOG${where}`;
    const countRows = await qe.executeQuery<{ total: number }>(countSql);
    const total = countRows[0]?.total ?? 0;

    const dataSql = `
      SELECT * FROM (
        SELECT ID, ACAO, TABELA, CODUSU, NOMEUSU, DTCREATED,
          ROW_NUMBER() OVER (ORDER BY ID DESC) AS RowNum
        FROM AD_GIG_LOG${where}
      ) AS T
      WHERE RowNum > ${offset} AND RowNum <= ${offset + limit}`;

    const rows = await qe.executeQuery<RegistroAuditoria>(dataSql);

    return {
      data: rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEstatisticas(tabela?: string): Promise<EstatisticasAuditoria> {
    const where = tabela
      ? ` WHERE TABELA LIKE '%${escapeSqlString(tabela)}%'`
      : '';

    const sql = `
      SELECT ACAO, COUNT(*) AS qty
      FROM AD_GIG_LOG${where}
      GROUP BY ACAO`;

    const rows = await qe.executeQuery<{ ACAO: string; qty: number }>(sql);

    const porOperacao: Record<string, number> = {};
    let totalRegistros = 0;
    for (const r of rows) {
      porOperacao[r.ACAO] = r.qty;
      totalRegistros += r.qty;
    }

    return { totalRegistros, porOperacao };
  }

  private buildWhere(filters: AuditoriaFilters): string {
    const conds: string[] = [];
    if (filters.tabela) {
      conds.push(`TABELA LIKE '%${escapeSqlString(filters.tabela)}%'`);
    }
    if (filters.usuario) {
      conds.push(`NOMEUSU LIKE '%${escapeSqlString(filters.usuario)}%'`);
    }
    if (filters.operacao) {
      conds.push(`ACAO = '${escapeSqlString(filters.operacao)}'`);
    }
    return conds.length > 0 ? ` WHERE ${conds.join(' AND ')}` : '';
  }
}
