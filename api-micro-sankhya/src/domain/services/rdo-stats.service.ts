import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  RdoCompleto, RdoStats, RdoTopColaborador, RdoResumoDiario,
} from '../../types/AD_RDOAPONTAMENTOS';
import * as Q from '../../sql-queries/AD_RDOAPONTAMENTOS';
import { escapeSqlDate } from '../../shared/sql-sanitize';

export class RdoStatsService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getByParceiro(
    codparc: number,
    page: number,
    limit: number,
  ): Promise<RdoCompleto[]> {
    const offset = (page - 1) * limit;
    const sql = Q.porParceiro
      .replace('@codparc', codparc.toString())
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());
    return this.queryExecutor.executeQuery<RdoCompleto>(sql);
  }

  async getByVeiculo(
    codveiculo: number,
    page: number,
    limit: number,
  ): Promise<RdoCompleto[]> {
    const offset = (page - 1) * limit;
    const sql = Q.porVeiculo
      .replace('@codveiculo', codveiculo.toString())
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());
    return this.queryExecutor.executeQuery<RdoCompleto>(sql);
  }

  async getStats(dataInicio?: string, dataFim?: string): Promise<RdoStats> {
    const conditions: string[] = [];
    if (dataInicio) {
      conditions.push(`AND rdo.DTREF >= '${escapeSqlDate(dataInicio)}'`);
    }
    if (dataFim) {
      conditions.push(`AND rdo.DTREF <= '${escapeSqlDate(dataFim)}'`);
    }
    const whereSql = conditions.join(' ');

    const applyWhere = (sql: string) => sql.replace(/-- @WHERE_RDO/g, whereSql);

    const [[baseRow], [itensRow], [prodRow], topColaboradores] = await Promise.all([
      this.queryExecutor.executeQuery<{ totalRdos: number; totalFuncionarios: number }>(
        applyWhere(Q.estatisticasBase),
      ),
      this.queryExecutor.executeQuery<{
        totalItens: number; totalMinutos: number | null;
        totalHoras: number | null; itensComOs: number; itensSemOs: number;
      }>(applyWhere(Q.estatisticasItens)),
      this.queryExecutor.executeQuery<{ percentualProdutivo: number | null }>(
        applyWhere(Q.estatisticasProdutividade),
      ),
      this.queryExecutor.executeQuery<RdoTopColaborador>(
        applyWhere(Q.topColaboradores),
      ),
    ]);

    const totalItens = itensRow?.totalItens ?? 0;
    const totalRdos = baseRow?.totalRdos ?? 0;

    return {
      totalRdos,
      totalItens,
      totalMinutos: itensRow?.totalMinutos,
      totalHoras: itensRow?.totalHoras,
      mediaItensPorRdo: totalRdos > 0 ? Math.round(totalItens / totalRdos * 10) / 10 : null,
      itensComOs: itensRow?.itensComOs ?? 0,
      itensSemOs: itensRow?.itensSemOs ?? 0,
      totalFuncionarios: baseRow?.totalFuncionarios ?? 0,
      percentualProdutivo: prodRow?.percentualProdutivo ?? null,
      topColaboradores,
    };
  }

  async getResumoDiario(
    page: number,
    limit: number,
    dataInicio?: string,
    dataFim?: string,
  ): Promise<RdoResumoDiario[]> {
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    if (dataInicio) {
      conditions.push(`rdo.DTREF >= '${escapeSqlDate(dataInicio)}'`);
    }
    if (dataFim) {
      conditions.push(`rdo.DTREF <= '${escapeSqlDate(dataFim)}'`);
    }

    const whereSql = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    const sql = Q.resumoDiario
      .replace('-- @WHERE', whereSql)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    return this.queryExecutor.executeQuery<RdoResumoDiario>(sql);
  }
}
