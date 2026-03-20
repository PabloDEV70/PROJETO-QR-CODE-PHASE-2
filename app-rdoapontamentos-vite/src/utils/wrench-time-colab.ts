import type {
  WrenchTimeMotivoDetail,
  ColaboradorWrenchTime,
  MotivoPorColab,
} from '../types/wrench-time-types';
import type { ColabRanking } from '../types/rdo-analytics-types';
import { getProdBenchmarkStatus, buildCategoryBreakdown } from './wrench-time-categories';

export function computeColabWrenchTime(
  data: MotivoPorColab[],
  rankingMap?: Map<number, ColabRanking>,
): ColaboradorWrenchTime[] {
  const colabMap = new Map<number, {
    codrdo: number | null; nomeparc: string; departamento: string | null; cargo: string;
    motivos: { cod: number; sigla: string; descricao: string; min: number; cat: string }[];
  }>();

  for (const row of data) {
    const entry = colabMap.get(row.codparc) ?? {
      codrdo: row.codrdo ?? null, nomeparc: row.nomeparc, departamento: row.departamento,
      cargo: row.cargo || '', motivos: [],
    };
    entry.motivos.push({
      cod: row.rdomotivocod, sigla: row.sigla,
      descricao: row.descricao, min: Math.round(Number(row.horasNoMotivo) * 60),
      cat: row.wtCategoria || 'externos',
    });
    colabMap.set(row.codparc, entry);
  }

  return Array.from(colabMap.entries()).map(([codparc, info]) => {
    const totalMin = info.motivos.reduce((s, m) => s + m.min, 0);
    const catMin = new Map<string, {
      min: number; motivos: WrenchTimeMotivoDetail[];
    }>();

    for (const m of info.motivos) {
      const e = catMin.get(m.cat) ?? { min: 0, motivos: [] };
      e.min += m.min;
      e.motivos.push({
        cod: m.cod, sigla: m.sigla, descricao: m.descricao,
        totalMin: m.min, percentOfCategory: 0,
      });
      catMin.set(m.cat, e);
    }

    const breakdowns = buildCategoryBreakdown(catMin, totalMin);
    const prodMin = breakdowns.find((b) => b.category === 'wrenchTime')?.totalMin ?? 0;
    const wtPercent = totalMin > 0 ? Math.round((prodMin / totalMin) * 100) : 0;

    const rdoItem = rankingMap?.get(codparc);
    const backendProd = rdoItem?.produtividadePercent;
    const prodPct = backendProd != null ? Math.round(backendProd) : wtPercent;

    return {
      codrdo: info.codrdo, codparc, nomeparc: info.nomeparc,
      departamento: info.departamento, cargo: info.cargo,
      wrenchTimePercent: wtPercent, produtividadePercent: prodPct,
      diagnostico: rdoItem?.diagnostico ?? '', totalMin, prodMin,
      benchmarkStatus: getProdBenchmarkStatus(prodPct), categoryBreakdown: breakdowns,
    };
  }).sort((a, b) => b.produtividadePercent - a.produtividadePercent);
}
