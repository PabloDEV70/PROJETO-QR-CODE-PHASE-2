import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  RdoAnalyticsOptions,
  RdoHoraExtraAggregate,
  HoraExtraPorColaborador,
  HoraExtraPorDepartamento,
  RdoAssiduidadeAggregate,
  AssiduidadePorColaborador,
} from '../../types/AD_RDOAPONTAMENTOS';
import { fetchAllRdoItems } from './rdo-manager-analytics.helpers';

export class RdoManagerAnalyticsService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getHoraExtra(options: RdoAnalyticsOptions): Promise<RdoHoraExtraAggregate> {
    const items = await fetchAllRdoItems(options, this.queryExecutor);
    const periodo = `${options.dataInicio || '?'} a ${options.dataFim || '?'}`;

    // Aggregate by colaborador
    const colabMap = new Map<number, {
      nomeparc: string; departamento: string | null; cargo: string | null;
      coddep: number | null; totalHE: number; diasHE: number; totalDias: number;
    }>();

    for (const item of items) {
      if (!item.CODPARC) continue;
      const existing = colabMap.get(item.CODPARC);
      const he = item.horaExtraMin || 0;
      if (!existing) {
        colabMap.set(item.CODPARC, {
          nomeparc: item.nomeparc || '',
          departamento: item.departamento,
          cargo: item.cargo,
          coddep: (item as any).coddep ?? null,
          totalHE: he,
          diasHE: he > 0 ? 1 : 0,
          totalDias: 1,
        });
      } else {
        existing.totalHE += he;
        existing.totalDias++;
        if (he > 0) existing.diasHE++;
      }
    }

    const porColaborador: HoraExtraPorColaborador[] = Array.from(colabMap.entries())
      .map(([codparc, c]) => ({
        codparc,
        nomeparc: c.nomeparc,
        departamento: c.departamento,
        cargo: c.cargo,
        totalHoraExtraMin: c.totalHE,
        diasComHoraExtra: c.diasHE,
        totalDias: c.totalDias,
        mediaHoraExtraMinDia: c.totalDias > 0
          ? Math.round(c.totalHE / c.totalDias * 10) / 10 : 0,
      }))
      .sort((a, b) => b.totalHoraExtraMin - a.totalHoraExtraMin);

    // Aggregate by departamento
    const depMap = new Map<string, {
      coddep: number | null; departamento: string | null;
      totalHE: number; codparcs: Set<number>;
    }>();

    for (const [codparc, c] of colabMap) {
      const key = String(c.coddep ?? 'null');
      const dep = depMap.get(key);
      if (!dep) {
        depMap.set(key, {
          coddep: c.coddep,
          departamento: c.departamento,
          totalHE: c.totalHE,
          codparcs: new Set([codparc]),
        });
      } else {
        dep.totalHE += c.totalHE;
        dep.codparcs.add(codparc);
      }
    }

    const porDepartamento: HoraExtraPorDepartamento[] = Array.from(depMap.values())
      .map((d) => ({
        coddep: d.coddep,
        departamento: d.departamento,
        totalHoraExtraMin: d.totalHE,
        totalColaboradores: d.codparcs.size,
        mediaHoraExtraMinPorColab: d.codparcs.size > 0
          ? Math.round(d.totalHE / d.codparcs.size * 10) / 10 : 0,
      }))
      .sort((a, b) => b.totalHoraExtraMin - a.totalHoraExtraMin);

    const totalHE = porColaborador.reduce((s, c) => s + c.totalHoraExtraMin, 0);

    return {
      data: { porColaborador, porDepartamento },
      meta: { totalHoraExtraMin: totalHE, totalColaboradores: colabMap.size, periodo },
    };
  }

  async getAssiduidade(options: RdoAnalyticsOptions): Promise<RdoAssiduidadeAggregate> {
    const items = await fetchAllRdoItems(options, this.queryExecutor);
    const periodo = `${options.dataInicio || '?'} a ${options.dataFim || '?'}`;

    const colabMap = new Map<number, {
      nomeparc: string; departamento: string | null;
      totalDias: number; diasCumpriu: number;
      totalAtraso: number; diasComAtraso: number;
    }>();

    for (const item of items) {
      if (!item.CODPARC) continue;
      const previsto = item.minutosPrevistosDia || 0;
      const trabalhado = item.tempoNoTrabalho || 0;
      const cumpriu = previsto > 0 && trabalhado >= previsto;
      const deficit = previsto > 0 ? Math.max(previsto - trabalhado, 0) : 0;

      const existing = colabMap.get(item.CODPARC);
      if (!existing) {
        colabMap.set(item.CODPARC, {
          nomeparc: item.nomeparc || '',
          departamento: item.departamento,
          totalDias: 1,
          diasCumpriu: cumpriu ? 1 : 0,
          totalAtraso: deficit,
          diasComAtraso: deficit > 0 ? 1 : 0,
        });
      } else {
        existing.totalDias++;
        if (cumpriu) existing.diasCumpriu++;
        existing.totalAtraso += deficit;
        if (deficit > 0) existing.diasComAtraso++;
      }
    }

    const data: AssiduidadePorColaborador[] = Array.from(colabMap.entries())
      .map(([codparc, c]) => ({
        codparc,
        nomeparc: c.nomeparc,
        departamento: c.departamento,
        totalDias: c.totalDias,
        diasCumpriuJornada: c.diasCumpriu,
        percentCumprimento: c.totalDias > 0
          ? Math.round(c.diasCumpriu / c.totalDias * 1000) / 10 : 0,
        totalAtrasoMin: c.totalAtraso,
        mediaAtrasoMin: c.totalDias > 0
          ? Math.round(c.totalAtraso / c.totalDias * 10) / 10 : 0,
        diasComAtraso: c.diasComAtraso,
      }))
      .sort((a, b) => b.percentCumprimento - a.percentCumprimento);

    const totalColabs = data.length;
    const avgCumpr = totalColabs > 0
      ? Math.round(data.reduce((s, d) => s + d.percentCumprimento, 0) / totalColabs * 10) / 10
      : 0;
    const avgAtraso = totalColabs > 0
      ? Math.round(data.reduce((s, d) => s + d.mediaAtrasoMin, 0) / totalColabs * 10) / 10
      : 0;

    return {
      data,
      meta: {
        totalColaboradores: totalColabs,
        mediaCumprimentoPercent: avgCumpr,
        mediaAtrasoGeral: avgAtraso,
        periodo,
      },
    };
  }
}
