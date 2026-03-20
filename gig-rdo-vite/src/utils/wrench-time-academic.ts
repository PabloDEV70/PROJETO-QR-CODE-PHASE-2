import type { WrenchTimeBreakdown, WrenchTimeCategory } from '@/types/wrench-time-types';

export type AcademicTier = 'produtivo' | 'improdNecessario' | 'improdDesnecessario';
export type AcademicBenchmarkZone = 'critico' | 'brasilMedio' | 'bom' | 'excelente' | 'worldClass';

export interface AcademicTierDef {
  key: AcademicTier;
  label: string;
  color: string;
  description: string;
  wtCategories: WrenchTimeCategory[];
}

export interface BenchmarkZoneDef {
  key: AcademicBenchmarkZone;
  label: string;
  color: string;
  min: number;
  max: number;
  description: string;
}

export interface AcademicTierResult {
  tier: AcademicTier;
  label: string;
  color: string;
  totalMin: number;
  percentOfTotal: number;
  categories: WrenchTimeBreakdown[];
}

export interface AcademicRecommendation {
  priority: 'alta' | 'media' | 'baixa';
  title: string;
  description: string;
  impactPercent: number;
}

export const ACADEMIC_TIERS: AcademicTierDef[] = [
  {
    key: 'produtivo', label: 'Produtivo (Wrench Time)', color: '#16A34A',
    description: 'Tempo real com ferramenta na mao — atividade produtiva direta',
    wtCategories: ['wrenchTime'],
  },
  {
    key: 'improdNecessario', label: 'Improdutivo Necessario', color: '#F59E0B',
    description: 'Burocracia, treinamento e pausas — inevitaveis mas otimizaveis',
    wtCategories: ['buro', 'trein', 'pausas'],
  },
  {
    key: 'improdDesnecessario', label: 'Improdutivo Desnecessario', color: '#EF4444',
    description: 'Deslocamento, espera e externos — eliminaveis com gestao',
    wtCategories: ['desloc', 'espera', 'externos'],
  },
];

export const BENCHMARK_ZONES: BenchmarkZoneDef[] = [
  { key: 'critico', label: 'Critico', color: '#991B1B', min: 0, max: 12,
    description: 'Abaixo do minimo aceitavel' },
  { key: 'brasilMedio', label: 'Brasil Medio', color: '#EF4444', min: 12, max: 25,
    description: 'Media da industria brasileira' },
  { key: 'bom', label: 'Bom', color: '#F59E0B', min: 25, max: 35,
    description: 'Acima da media, caminho certo' },
  { key: 'excelente', label: 'Excelente', color: '#16A34A', min: 35, max: 72,
    description: 'Referencia em eficiencia' },
  { key: 'worldClass', label: 'World Class', color: '#065F46', min: 72, max: 100,
    description: 'Nivel de classe mundial' },
];

export function groupByAcademicTier(breakdowns: WrenchTimeBreakdown[]): AcademicTierResult[] {
  const totalMin = breakdowns.reduce((s, b) => s + b.totalMin, 0);
  return ACADEMIC_TIERS.map((tier) => {
    const cats = breakdowns.filter((b) => tier.wtCategories.includes(b.category));
    const tierMin = cats.reduce((s, c) => s + c.totalMin, 0);
    return {
      tier: tier.key, label: tier.label, color: tier.color,
      totalMin: tierMin,
      percentOfTotal: totalMin > 0 ? Math.round((tierMin / totalMin) * 100) : 0,
      categories: cats,
    };
  });
}

export function getAcademicBenchmarkZone(percent: number): BenchmarkZoneDef {
  return BENCHMARK_ZONES.find((z) => percent >= z.min && percent < z.max)
    ?? BENCHMARK_ZONES[BENCHMARK_ZONES.length - 1]!;
}

export function getAcademicRecommendations(
  breakdowns: WrenchTimeBreakdown[],
  wrenchTimePercent: number,
): AcademicRecommendation[] {
  const losses = breakdowns
    .filter((b) => b.category !== 'wrenchTime' && b.totalMin > 0)
    .sort((a, b) => b.percentOfTotal - a.percentOfTotal);

  const recs: AcademicRecommendation[] = [];
  for (const loss of losses.slice(0, 4)) {
    const priority = loss.percentOfTotal >= 20 ? 'alta'
      : loss.percentOfTotal >= 10 ? 'media' : 'baixa';
    recs.push({
      priority,
      title: `Reduzir ${loss.label}`,
      description: `${loss.label} consome ${loss.percentOfTotal}% do tempo total. ${loss.tips}`,
      impactPercent: loss.percentOfTotal,
    });
  }

  if (wrenchTimePercent < 25) {
    recs.unshift({
      priority: 'alta',
      title: 'Fator de Produtividade Critico',
      description: `FP atual (${wrenchTimePercent}%) esta abaixo da media brasileira (25%). Priorizar eliminacao de perdas desnecessarias.`,
      impactPercent: 25 - wrenchTimePercent,
    });
  }
  return recs.slice(0, 5);
}
