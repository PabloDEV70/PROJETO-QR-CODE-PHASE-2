import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString } from '../../shared/sql-sanitize';
import * as Q from '../../sql-queries/AD_CALENDARIOCOMERCIAL';
import type { CalendarioComercialItem, CalendarioStats } from '../../types/AD_CALENDARIOCOMERCIAL';

export class CalendarioComercialService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async list(filters: { dataInicio: string; dataFim: string; codVeiculo?: number; status?: string; page?: number; limit?: number }) {
    const { dataInicio, dataFim, codVeiculo, status, page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;

    let sql = Q.calendarioList
      .replace(/@dataInicio/g, `'${dataInicio}'`)
      .replace(/@dataFim/g, `'${dataFim}'`)
      .replace(/@codVeiculo/g, codVeiculo ? String(codVeiculo) : 'NULL')
      .replace(/@status/g, status ? `'${escapeSqlString(status)}'` : 'NULL')
      .replace(/@offset/g, String(offset))
      .replace(/@limit/g, String(limit));

    let countSql = Q.calendarioCount
      .replace(/@dataInicio/g, `'${dataInicio}'`)
      .replace(/@dataFim/g, `'${dataFim}'`)
      .replace(/@codVeiculo/g, codVeiculo ? String(codVeiculo) : 'NULL')
      .replace(/@status/g, status ? `'${escapeSqlString(status)}'` : 'NULL');

    const [data, countRows] = await Promise.all([
      this.qe.executeQuery<CalendarioComercialItem>(sql),
      this.qe.executeQuery<{ TOTAL: number }>(countSql),
    ]);

    const total = countRows[0]?.TOTAL ?? 0;
    return {
      data,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async getById(id: number) {
    const sql = Q.calendarioById.replace(/@id/g, String(id));
    const rows = await this.qe.executeQuery<CalendarioComercialItem>(sql);
    return rows[0] || null;
  }

  async getStats(filters: { dataInicio: string; dataFim: string; codVeiculo?: number; status?: string }) {
    const sql = Q.calendarioStats
      .replace(/@dataInicio/g, `'${filters.dataInicio}'`)
      .replace(/@dataFim/g, `'${filters.dataFim}'`)
      .replace(/@codVeiculo/g, filters.codVeiculo ? String(filters.codVeiculo) : 'NULL')
      .replace(/@status/g, filters.status ? `'${escapeSqlString(filters.status)}'` : 'NULL');
    const rows = await this.qe.executeQuery<CalendarioStats>(sql);
    return rows[0] || null;
  }

  async getByVeiculo(codVeiculo: number, dataInicio: string, dataFim: string) {
    const sql = Q.calendarioByVeiculo
      .replace(/@codVeiculo/g, String(codVeiculo))
      .replace(/@dataInicio/g, `'${dataInicio}'`)
      .replace(/@dataFim/g, `'${dataFim}'`);
    return this.qe.executeQuery<CalendarioComercialItem>(sql);
  }
}
