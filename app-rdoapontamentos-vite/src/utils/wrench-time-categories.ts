import type {
  WrenchTimeCategoryDef,
  WrenchTimeMetrics,
  WrenchTimeBreakdown,
  WrenchTimeMotivoDetail,
  BenchmarkStatus,
  WtDeductions,
} from '../types/wrench-time-types';
import type { RdoAnalyticsMotivo, RdoWtSummary } from '../types/rdo-analytics-types';

export { computeColabWrenchTime } from './wrench-time-colab';

const CATEGORY_META: Record<string, Omit<WrenchTimeCategoryDef, 'key'>> = {
  wrenchTime: {
    label: 'Wrench Time', color: '#16A34A',
    description: 'Tempo real com ferramenta na mao', tips: 'Meta: >50% do tempo total',
  },
  desloc: {
    label: 'Deslocamento', color: '#3B82F6',
    description: 'Translado entre locais de trabalho',
    tips: 'Otimizar rotas e planejar sequencia de servicos proximos',
  },
  espera: {
    label: 'Espera', color: '#F59E0B',
    description: 'Aguardando pecas, decisoes ou terceiros',
    tips: 'Melhorar planejamento de pecas e pre-aprovar servicos',
  },
  buro: {
    label: 'Burocracia', color: '#8B5CF6',
    description: 'Abertura de OS e alinhamentos',
    tips: 'Digitalizar processos e reduzir etapas de aprovacao',
  },
  trein: {
    label: 'Treinamento/Seguranca', color: '#06B6D4',
    description: 'DDS, treinamentos, 5S e EPIs',
    tips: 'Manter DDS objetivo (<15min) e treinamentos programados',
  },
  pausas: {
    label: 'Pausas/Pessoal', color: '#64748B',
    description: 'Almoco, lanche, banheiro e necessidades pessoais',
    tips: 'Pausas sao necessarias — monitorar apenas excessos',
  },
  externos: {
    label: 'Externos/Clima', color: '#EF4444',
    description: 'Condicoes climaticas e emergencias',
    tips: 'Planejar atividades internas para dias de chuva',
  },
};

const FALLBACK_META: Omit<WrenchTimeCategoryDef, 'key'> = {
  label: 'Outros', color: '#9CA3AF',
  description: 'Categoria nao mapeada', tips: '',
};

export const CATEGORY_META_KEYS = Object.keys(CATEGORY_META);

export function getCategoryMeta(cat: string): Omit<WrenchTimeCategoryDef, 'key'> {
  return CATEGORY_META[cat] ?? FALLBACK_META;
}

export const WRENCH_TIME_CATEGORIES: WrenchTimeCategoryDef[] =
  Object.entries(CATEGORY_META).map(([key, meta]) => ({ key, ...meta }));

export function getBenchmarkStatus(percent: number): BenchmarkStatus {
  if (percent >= 50) return 'above';
  if (percent >= 35) return 'target';
  return 'below';
}

export function getProdBenchmarkStatus(percent: number): BenchmarkStatus {
  if (percent >= 95) return 'above';
  if (percent >= 85) return 'target';
  return 'below';
}

export function getBenchmarkColor(status: BenchmarkStatus): string {
  if (status === 'above') return '#16A34A';
  if (status === 'target') return '#F59E0B';
  return '#EF4444';
}

export function buildCategoryBreakdown(
  catMinutes: Map<string, { min: number; motivos: WrenchTimeMotivoDetail[] }>,
  totalMin: number,
): WrenchTimeBreakdown[] {
  for (const entry of catMinutes.values()) {
    for (const md of entry.motivos) {
      md.percentOfCategory = entry.min > 0
        ? Math.round((md.totalMin / entry.min) * 100) : 0;
    }
  }

  const allCats = new Set([...CATEGORY_META_KEYS, ...catMinutes.keys()]);
  return Array.from(allCats)
    .map((cat) => {
      const meta = getCategoryMeta(cat);
      const entry = catMinutes.get(cat);
      const catMin = entry?.min ?? 0;
      return {
        category: cat, label: meta.label, color: meta.color,
        totalMin: catMin,
        percentOfTotal: totalMin > 0
          ? Math.round((catMin / totalMin) * 100) : 0,
        motivos: entry?.motivos.sort((a, b) => b.totalMin - a.totalMin) ?? [],
        tips: meta.tips,
      };
    })
    .sort((a, b) => {
      if (a.category === 'wrenchTime') return -1;
      if (b.category === 'wrenchTime') return 1;
      return b.totalMin - a.totalMin;
    });
}

const MOTIVO_ALMOCO = 3;
const MOTIVO_BANHEIRO = 2;

export function computeWrenchTimeMetrics(
  motivos: RdoAnalyticsMotivo[],
  wtSummary?: RdoWtSummary,
): WrenchTimeMetrics {
  const emptyDeductions: WtDeductions = {
    almocoTotalMin: 0, almocoProgramadoMin: 0, almocoExcessoMin: 0,
    banheiroTotalMin: 0, banheiroToleranciaMin: 0, banheiroExcessoMin: 0,
    totalRdos: 0, totalBrutoMin: 0, baseEfetivaMin: 0,
  };
  if (!motivos.length) {
    return {
      wrenchTimePercent: 0, totalProdMin: 0, totalLossMin: 0, totalMin: 0,
      benchmarkStatus: 'below', breakdowns: [], topLossCategory: null, topLossMin: 0,
      deductions: emptyDeductions,
    };
  }

  const d = wtSummary ?? emptyDeductions;
  const baseEfetivaMin = d.baseEfetivaMin || 0;

  const catMinutes = new Map<string, { min: number; motivos: WrenchTimeMotivoDetail[] }>();

  for (const m of motivos) {
    const cat = m.wtCategoria || 'externos';
    let mMin = Math.round(Number(m.totalHoras) * 60);

    if (m.rdomotivocod === MOTIVO_ALMOCO) mMin = d.almocoExcessoMin;
    else if (m.rdomotivocod === MOTIVO_BANHEIRO) mMin = d.banheiroExcessoMin;

    const entry = catMinutes.get(cat) ?? { min: 0, motivos: [] };
    entry.min += mMin;
    entry.motivos.push({
      cod: m.rdomotivocod, sigla: m.sigla, descricao: m.descricao,
      totalMin: mMin, percentOfCategory: 0,
    });
    catMinutes.set(cat, entry);
  }

  const breakdowns = buildCategoryBreakdown(catMinutes, baseEfetivaMin);

  const prodMin = breakdowns.find((b) => b.category === 'wrenchTime')?.totalMin ?? 0;
  const lossMin = baseEfetivaMin - prodMin;
  const wtPercent = baseEfetivaMin > 0
    ? Math.round((prodMin / baseEfetivaMin) * 100) : 0;
  const losses = breakdowns.filter((b) => b.category !== 'wrenchTime');
  const topLoss = losses.length > 0 ? losses[0]! : null;

  return {
    wrenchTimePercent: wtPercent,
    totalProdMin: prodMin,
    totalLossMin: lossMin,
    totalMin: baseEfetivaMin,
    benchmarkStatus: getBenchmarkStatus(wtPercent),
    breakdowns,
    topLossCategory: topLoss?.label ?? null,
    topLossMin: topLoss?.totalMin ?? 0,
    deductions: d,
  };
}

export const fmtMin = (m: number): string => {
  const h = Math.floor(Math.abs(m) / 60);
  const mm = Math.round(Math.abs(m) % 60);
  return h > 0 ? `${h}h${mm > 0 ? ` ${String(mm).padStart(2, '0')}m` : ''}` : `${mm}m`;
};
