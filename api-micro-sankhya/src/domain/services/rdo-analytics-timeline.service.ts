import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  RdoAnalyticsOptions,
  RdoTimelinePoint,
  RdoTimelineMotivoRow,
  RdoPeriodMetrics,
  RdoComparativo,
  RdoAnomalia,
} from '../../types/AD_RDOAPONTAMENTOS';
import { buildWhere } from './rdo-query-helpers';
import * as Q from '../../sql-queries/AD_RDOAPONTAMENTOS';

export class RdoAnalyticsTimelineService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getTimeline(options: RdoAnalyticsOptions): Promise<RdoTimelinePoint[]> {
    const where = buildWhere(options);
    const sql = Q.analyticsTimeline.replace('-- @WHERE', where);
    const rows = await this.queryExecutor.executeQuery<RdoTimelinePoint>(sql);
    return rows.map((r) => ({
      ...r,
      minutosHoraExtraNaoProd:
        Number(r.minutosHoraExtra) - Number(r.minutosHoraExtraProd),
    }));
  }

  async getTimelineMotivos(
    options: RdoAnalyticsOptions,
  ): Promise<RdoTimelineMotivoRow[]> {
    const where = buildWhere(options);
    const sql = Q.analyticsTimelineMotivos.replace('-- @WHERE', where);
    return this.queryExecutor.executeQuery<RdoTimelineMotivoRow>(sql);
  }

  async getComparativo(options: RdoAnalyticsOptions): Promise<RdoComparativo> {
    const dataInicio = options.dataInicio || (() => {
      const d = new Date(); d.setDate(d.getDate() - 30);
      return d.toISOString().split('T')[0];
    })();
    const dataFim = options.dataFim || new Date().toISOString().split('T')[0];

    const start = new Date(dataInicio);
    const end = new Date(dataFim);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - diffDays);

    const filterWhere = buildWhere({
      ...options, dataInicio: undefined, dataFim: undefined,
    });

    const atualSql = Q.analyticsComparativo
      .replace('@dataInicio', dataInicio)
      .replace('@dataFim', dataFim)
      .replace('-- @WHERE', filterWhere);

    const anteriorSql = Q.analyticsComparativo
      .replace('@dataInicio', prevStart.toISOString().split('T')[0])
      .replace('@dataFim', prevEnd.toISOString().split('T')[0])
      .replace('-- @WHERE', filterWhere);

    const [atualRows, anteriorRows] = await Promise.all([
      this.queryExecutor.executeQuery<RdoPeriodMetrics>(atualSql),
      this.queryExecutor.executeQuery<RdoPeriodMetrics>(anteriorSql),
    ]);

    const empty: RdoPeriodMetrics = {
      totalRdos: 0, totalColaboradores: 0, totalDetalhes: 0,
      totalHoras: 0, mediaMinutosPorItem: 0, itensComOs: 0, diasComDados: 0,
    };
    const atual = atualRows[0] || empty;
    const anterior = anteriorRows[0] || empty;

    const pctOs = (m: RdoPeriodMetrics) =>
      m.totalDetalhes > 0 ? (m.itensComOs / m.totalDetalhes) * 100 : 0;

    return {
      atual,
      anterior,
      deltas: {
        totalRdos: Number(atual.totalRdos) - Number(anterior.totalRdos),
        totalColaboradores: Number(atual.totalColaboradores) - Number(anterior.totalColaboradores),
        totalHoras: Number(atual.totalHoras) - Number(anterior.totalHoras),
        mediaMinutosPorItem: Number(atual.mediaMinutosPorItem) - Number(anterior.mediaMinutosPorItem),
        percentualComOs: pctOs(atual) - pctOs(anterior),
      },
    };
  }

  async getAnomalias(options: RdoAnalyticsOptions): Promise<RdoAnomalia[]> {
    const where = buildWhere(options);
    const sql = Q.analyticsAnomalias.replace('-- @WHERE', where);
    return this.queryExecutor.executeQuery<RdoAnomalia>(sql);
  }
}
