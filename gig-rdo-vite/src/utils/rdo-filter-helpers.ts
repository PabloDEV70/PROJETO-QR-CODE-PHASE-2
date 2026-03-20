import { DensitySmall, DensityMedium, DensityLarge } from '@mui/icons-material';
import type { MotivoGroup } from '@/components/rdo/rdo-motivo-treemap';
import type { RdoAnalyticsMotivo } from '@/types/rdo-analytics-types';

export type Density = 'compact' | 'standard' | 'comfortable';

export const densityOptions: { value: Density; icon: typeof DensitySmall; label: string }[] = [
  { value: 'compact', icon: DensitySmall, label: 'Compacto' },
  { value: 'standard', icon: DensityMedium, label: 'Padrao' },
  { value: 'comfortable', icon: DensityLarge, label: 'Confortavel' },
];

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Mes RH: dia 21 do mes anterior ate dia 20 do mes atual */
export function getMesRhDates(): { ini: string; fim: string } {
  const now = new Date();
  const ini = new Date(now.getFullYear(), now.getMonth() - 1, 21);
  const fim = new Date(now.getFullYear(), now.getMonth(), 20);
  return { ini: toISO(ini), fim: toISO(fim) };
}

export interface PeriodPreset {
  key: string;
  label: string;
  ini: string;
  fim: string;
}

export function getPeriodPresets(): PeriodPreset[] {
  const now = new Date();
  const today = toISO(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const d7 = new Date(now);
  d7.setDate(now.getDate() - 6);
  const d15 = new Date(now);
  d15.setDate(now.getDate() - 14);
  const d30 = new Date(now);
  d30.setDate(now.getDate() - 29);
  const mesAtual = new Date(now.getFullYear(), now.getMonth(), 1);
  const mesAnteriorIni = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const mesAnteriorFim = new Date(now.getFullYear(), now.getMonth(), 0);

  // Mes RH: dia 21 do mes passado ate dia 20 do mes atual
  const mesRhIni = new Date(now.getFullYear(), now.getMonth() - 1, 21);
  const mesRhFim = new Date(now.getFullYear(), now.getMonth(), 20);

  return [
    { key: 'hoje', label: 'Hoje', ini: today, fim: today },
    { key: 'ontem', label: 'Ontem', ini: toISO(yesterday), fim: toISO(yesterday) },
    { key: '7d', label: '7 dias', ini: toISO(d7), fim: today },
    { key: '15d', label: '15 dias', ini: toISO(d15), fim: today },
    { key: '30d', label: '30 dias', ini: toISO(d30), fim: today },
    { key: 'mes', label: 'Este mes', ini: toISO(mesAtual), fim: today },
    { key: 'mesrh', label: 'Mes RH', ini: toISO(mesRhIni), fim: toISO(mesRhFim) },
    { key: 'mesant', label: 'Mes anterior', ini: toISO(mesAnteriorIni), fim: toISO(mesAnteriorFim) },
  ];
}

export function getActivePresetKey(
  dataInicio: string,
  dataFim: string,
): string | null {
  const presets = getPeriodPresets();
  const match = presets.find((p) => p.ini === dataInicio && p.fim === dataFim);
  return match?.key || null;
}

const MOTIVO_ALMOCO = 3;

export interface ExcessGroup extends MotivoGroup {
  originalTotalMin: number;
  toleranciaMin: number;
  isExcedente: boolean;
}

export interface ExcessResult {
  groups: ExcessGroup[];
  totalMin: number;
  hasExcedentes: boolean;
}

/**
 * Transforms motivo groups to show only excess time beyond tolerance.
 * Uses API tolerancia field from RdoAnalyticsMotivo directly (no config store).
 * - ALMOCO (3): tolerance = backend toleranciaProgramadaTotalMin + (api.tolerancia * count)
 * - Others with tolerancia > 0: tolerance = api.tolerancia * count
 * - Motivos with excess <= 0 are removed
 */
export function computeExcessGroups(
  groups: MotivoGroup[],
  apiData: RdoAnalyticsMotivo[],
): ExcessResult {
  const apiMap = new Map(apiData.map((m) => [m.rdomotivocod, m]));
  let hasAnyTolerance = false;

  const filtered: ExcessGroup[] = [];
  for (const g of groups) {
    if (g.cod == null) {
      filtered.push({ ...g, originalTotalMin: g.totalMin, toleranciaMin: 0, isExcedente: false });
      continue;
    }
    const api = apiMap.get(g.cod);
    const apiTol = api?.tolerancia ?? 0;
    let tolerancia = 0;

    if (g.cod === MOTIVO_ALMOCO) {
      const programada = api?.toleranciaProgramadaTotalMin ?? 0;
      tolerancia = programada + (apiTol * g.count);
    } else if (apiTol > 0) {
      tolerancia = apiTol * g.count;
    }

    if (tolerancia > 0) hasAnyTolerance = true;
    const excess = g.totalMin - tolerancia;
    if (tolerancia > 0 && excess <= 0) continue;

    filtered.push({
      ...g,
      totalMin: tolerancia > 0 ? excess : g.totalMin,
      originalTotalMin: g.totalMin,
      toleranciaMin: tolerancia,
      isExcedente: tolerancia > 0,
    });
  }

  const totalMin = filtered.reduce((s, g) => s + g.totalMin, 0);
  return { groups: filtered, totalMin, hasExcedentes: hasAnyTolerance };
}
