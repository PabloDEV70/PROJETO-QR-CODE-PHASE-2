import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  RdoAnalyticsOptions,
  RdoAnalyticsProdutividade,
  RdoAnalyticsEficiencia,
  RdoAnalyticsMotivo,
  RdoAnalyticsMotivoPorColaborador,
  RdoAnalyticsResumo,
  RdoTimelinePoint,
  RdoTimelineMotivoRow,
  RdoComparativo,
  RdoAnomalia,
  RdoListItem,
  MOTIVO_ALMOCO,
} from '../../types/AD_RDOAPONTAMENTOS';
import { buildWhere, buildOrder } from './rdo-query-helpers';
import { calcToleranciaAlmoco } from './rdo-almoco-tolerancia.helpers';
import * as Q from '../../sql-queries/AD_RDOAPONTAMENTOS';
import { RdoAnalyticsTimelineService } from './rdo-analytics-timeline.service';
import { RdoService } from './rdo.service';
import { fetchAllRdoItems } from './rdo-manager-analytics.helpers';
import { getDiagnosticoBackend } from './rdo-produtividade-calc';
import { MotivoConfigService } from './motivo-config.service';

export interface ColabRanking {
  codparc: number;
  nomeparc: string;
  departamento: string;
  cargo: string;
  totalRdos: number;
  minutosProdu: number;
  tempoNoTrabalho: number;
  produtividadePercent: number;
  horaExtraMin: number;
  diagnostico: string;
}

export interface ColabOvertimeRanking {
  codparc: number;
  nomeparc: string;
  departamento: string;
  cargo: string;
  totalRdos: number;
  horaExtraMin: number;
  diasComHE: number;
}

export class RdoAnalyticsService {
  private queryExecutor: QueryExecutor;
  private timelineService: RdoAnalyticsTimelineService;

  constructor() {
    this.queryExecutor = new QueryExecutor();
    this.timelineService = new RdoAnalyticsTimelineService();
  }

  async getProdutividade(options: RdoAnalyticsOptions) {
    const { orderBy = 'totalHoras', orderDir = 'DESC', limit = 20 } = options;
    const sql = Q.analyticsProdutividade
      .replace('-- @WHERE', buildWhere(options))
      .replace('-- @ORDER', buildOrder(orderBy, orderDir, 'totalHoras'))
      .replace(/@LIMIT/g, limit.toString());

    const data = await this.queryExecutor
      .executeQuery<RdoAnalyticsProdutividade>(sql);
    return { data, meta: { total: data.length, limit } };
  }

  async getEficiencia(options: RdoAnalyticsOptions) {
    const { orderBy = 'mediaMinutosPorItem', orderDir = 'ASC', limit = 20 } = options;
    const sql = Q.analyticsEficiencia
      .replace('-- @WHERE', buildWhere(options))
      .replace('-- @ORDER', buildOrder(orderBy, orderDir, 'mediaMinutosPorItem'))
      .replace(/@LIMIT/g, limit.toString());

    const data = await this.queryExecutor
      .executeQuery<RdoAnalyticsEficiencia>(sql);
    return { data, meta: { total: data.length, limit } };
  }

  async getMotivos(options: RdoAnalyticsOptions) {
    const whereSql = buildWhere(options);
    const sql = Q.analyticsMotivos.replace('-- @WHERE', whereSql);
    const rows = await this.queryExecutor
      .executeQuery<RdoAnalyticsMotivo>(sql);

    const totalHoras = rows.reduce((sum, r) => sum + Number(r.totalHoras), 0);

    const toleranciaAlmoco = await calcToleranciaAlmoco(
      whereSql, this.queryExecutor,
    );

    const data = rows.map((r) => ({
      ...r,
      percentualDoTotal: totalHoras > 0
        ? Math.round(Number(r.totalHoras) / totalHoras * 10000) / 100
        : 0,
      toleranciaProgramadaTotalMin: r.rdomotivocod === MOTIVO_ALMOCO
        ? toleranciaAlmoco : 0,
    }));

    // Wrench Time summary with deductions (almoco/banheiro)
    const configService = new MotivoConfigService();
    const configMap = await configService.getConfigMap();
    const MOTIVO_BANHEIRO = 2;
    const banheiroTolPerRdo = configMap.get(MOTIVO_BANHEIRO)?.toleranciaMin ?? 10;

    const almoco = data.find((r) => r.rdomotivocod === MOTIVO_ALMOCO);
    const banheiro = data.find((r) => r.rdomotivocod === MOTIVO_BANHEIRO);

    const almocoTotalMin = almoco ? Math.round(Number(almoco.totalHoras) * 60) : 0;
    const almocoProgramadoMin = almoco?.toleranciaProgramadaTotalMin ?? 0;
    const almocoExcessoMin = Math.max(0, almocoTotalMin - almocoProgramadoMin);

    const banheiroTotalMin = banheiro ? Math.round(Number(banheiro.totalHoras) * 60) : 0;
    const banheiroRdos = banheiro?.rdosComMotivo ?? 0;
    const banheiroToleranciaMin = banheiroRdos * banheiroTolPerRdo;
    const banheiroExcessoMin = Math.max(0, banheiroTotalMin - banheiroToleranciaMin);

    const totalBrutoMin = Math.round(totalHoras * 60);
    const deducaoAlmoco = Math.min(almocoTotalMin, almocoProgramadoMin);
    const deducaoBanheiro = Math.min(banheiroTotalMin, banheiroToleranciaMin);
    const baseEfetivaMin = totalBrutoMin - deducaoAlmoco - deducaoBanheiro;

    const totalRdos = Math.max(...data.map((r) => r.rdosComMotivo), 0);

    const wtSummary = {
      almocoTotalMin, almocoProgramadoMin, almocoExcessoMin,
      banheiroTotalMin, banheiroToleranciaMin, banheiroExcessoMin,
      totalRdos, totalBrutoMin, baseEfetivaMin,
    };

    return { data, meta: { total: data.length, totalHoras }, wtSummary };
  }

  async getMotivosPorColaborador(options: RdoAnalyticsOptions) {
    const { limit = 500 } = options;
    const sql = Q.analyticsMotivosPorColaborador
      .replace('-- @WHERE', buildWhere(options))
      .replace(/@LIMIT/g, limit.toString());

    const rows = await this.queryExecutor
      .executeQuery<RdoAnalyticsMotivoPorColaborador>(sql);

    const byColaborador = new Map<number, { nomeparc: string; total: number }>();
    for (const r of rows) {
      const curr = byColaborador.get(r.codparc);
      const hrs = Number(r.horasNoMotivo);
      if (!curr) {
        byColaborador.set(r.codparc, { nomeparc: r.nomeparc, total: hrs });
      } else {
        curr.total += hrs;
      }
    }

    const data = rows.map((r) => {
      const total = byColaborador.get(r.codparc)?.total || 0;
      return {
        ...r,
        percentual: total > 0
          ? Math.round(Number(r.horasNoMotivo) / total * 10000) / 100
          : 0,
      };
    });

    return { data, meta: { total: data.length } };
  }

  async getResumo(options: RdoAnalyticsOptions): Promise<RdoAnalyticsResumo> {
    const whereSql = buildWhere(options);
    const resumoSql = Q.analyticsResumo.replace('-- @WHERE', whereSql);
    const topSql = Q.analyticsResumoTopMotivo.replace('-- @WHERE', whereSql);
    const jornadaSql = Q.analyticsResumoJornada.replace('-- @WHERE', whereSql);

    const [resumoRows, topRows, jornadaRows] = await Promise.all([
      this.queryExecutor.executeQuery<any>(resumoSql),
      this.queryExecutor.executeQuery<any>(topSql),
      this.queryExecutor.executeQuery<any>(jornadaSql),
    ]);

    const r = resumoRows[0] || {};
    const t = topRows[0] || {};
    const j = jornadaRows[0] || {};
    const totalHoras = Number(r.totalHoras) || 0;
    const horasMotivo = Number(t.horasMotivo) || 0;
    const pct = totalHoras > 0
      ? Math.round(horasMotivo / totalHoras * 10000) / 100
      : 0;

    return {
      totalRdos: r.totalRdos || 0,
      totalDetalhes: r.totalDetalhes || 0,
      totalColaboradores: r.totalColaboradores || 0,
      totalHoras,
      totalMinutosPrevistos: Number(j.totalMinutosPrevistos) || 0,
      mediaHorasDia: Number(r.mediaHorasDia) || 0,
      mediaHorasPorColabDia: (r.totalRdos || 0) > 0
        ? Math.round(totalHoras / (r.totalRdos || 1) * 100) / 100
        : 0,
      mediaRdosPorColab: (r.totalColaboradores || 0) > 0
        ? Math.round((r.totalRdos || 0) / (r.totalColaboradores || 1) * 100) / 100
        : 0,
      mediaItensPorRdo: Number(r.mediaItensPorRdo) || 0,
      diasComDados: r.diasComDados || 0,
      topMotivo: t.topMotivo || '',
      topMotivoSigla: t.topMotivoSigla || '',
      topMotivoPercentual: pct,
      percentualComOs: Number(r.percentualComOs) || 0,
    };
  }

  async getTimeline(options: RdoAnalyticsOptions): Promise<RdoTimelinePoint[]> {
    return this.timelineService.getTimeline(options);
  }

  async getTimelineMotivos(
    options: RdoAnalyticsOptions,
  ): Promise<RdoTimelineMotivoRow[]> {
    return this.timelineService.getTimelineMotivos(options);
  }

  async getComparativo(options: RdoAnalyticsOptions): Promise<RdoComparativo> {
    return this.timelineService.getComparativo(options);
  }

  async getAnomalias(options: RdoAnalyticsOptions): Promise<RdoAnomalia[]> {
    return this.timelineService.getAnomalias(options);
  }

  async getRanking(options: RdoAnalyticsOptions): Promise<ColabRanking[]> {
    const items = await fetchAllRdoItems(options, this.queryExecutor);

    const map = new Map<number, {
      nomeparc: string; departamento: string; cargo: string;
      totalRdos: number; minutosProdu: number; tempoNoTrabalho: number;
      horaExtraMin: number;
    }>();

    for (const item of items) {
      if (!item.CODPARC) continue;
      const cur = map.get(item.CODPARC);
      if (!cur) {
        map.set(item.CODPARC, {
          nomeparc: item.nomeparc || '',
          departamento: (item.departamento || '').trim(),
          cargo: (item.cargo || '').trim(),
          totalRdos: 1,
          minutosProdu: item.minutosProdu,
          tempoNoTrabalho: item.tempoNoTrabalho,
          horaExtraMin: item.horaExtraMin,
        });
      } else {
        cur.totalRdos += 1;
        cur.minutosProdu += item.minutosProdu;
        cur.tempoNoTrabalho += item.tempoNoTrabalho;
        cur.horaExtraMin += item.horaExtraMin;
      }
    }

    return Array.from(map.entries())
      .map(([codparc, c]) => {
        const pct = c.tempoNoTrabalho > 0
          ? Math.min(Math.round((c.minutosProdu / c.tempoNoTrabalho) * 100), 100)
          : 0;
        return {
          codparc,
          nomeparc: c.nomeparc,
          departamento: c.departamento,
          cargo: c.cargo,
          totalRdos: c.totalRdos,
          minutosProdu: c.minutosProdu,
          tempoNoTrabalho: c.tempoNoTrabalho,
          produtividadePercent: pct,
          horaExtraMin: c.horaExtraMin,
          diagnostico: getDiagnosticoBackend(pct, c.horaExtraMin),
        };
      })
      .sort((a, b) => b.produtividadePercent - a.produtividadePercent);
  }

  async getOvertimeRanking(
    options: RdoAnalyticsOptions,
  ): Promise<ColabOvertimeRanking[]> {
    const rdoService = new RdoService();
    const result = await rdoService.list({
      page: 1, limit: 9999,
      dataInicio: options.dataInicio,
      dataFim: options.dataFim,
      codparc: options.codparc,
      coddep: options.coddep,
      codcargo: options.codcargo,
      codfuncao: options.codfuncao,
      codemp: options.codemp,
    });

    const map = new Map<number, {
      nomeparc: string; departamento: string; cargo: string;
      totalRdos: number; horaExtraMin: number; diasComHE: number;
    }>();

    for (const rdo of result.data) {
      if (!rdo.CODPARC) continue;
      const cur = map.get(rdo.CODPARC);
      const he = rdo.horaExtraMin || 0;
      if (!cur) {
        map.set(rdo.CODPARC, {
          nomeparc: rdo.nomeparc || '',
          departamento: (rdo.departamento || '').trim(),
          cargo: (rdo.cargo || '').trim(),
          totalRdos: 1,
          horaExtraMin: he,
          diasComHE: he > 0 ? 1 : 0,
        });
      } else {
        cur.totalRdos += 1;
        cur.horaExtraMin += he;
        if (he > 0) cur.diasComHE += 1;
      }
    }

    const ranking: ColabOvertimeRanking[] = [];
    for (const [codparc, c] of map) {
      if (c.horaExtraMin > 0) {
        ranking.push({ codparc, ...c });
      }
    }
    ranking.sort((a, b) => b.horaExtraMin - a.horaExtraMin);
    return ranking;
  }
}
