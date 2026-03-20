/**
 * Config-aware motivo classification for dashboard KPIs.
 * Uses API data (RdoAnalyticsMotivo) instead of Zustand config store.
 */
import type { MotivoGroup } from '@/components/rdo/rdo-motivo-treemap';
import type { RdoAnalyticsMotivo } from '@/types/rdo-analytics-types';

/**
 * Derive the wtCategoria string for a motivo using the API.
 * If the API marks it as productive (produtivo === 'S'), returns 'wrenchTime'.
 * Otherwise returns the wtCategoria from the API data, falling back to 'externos'.
 */
export function categorizeWithConfig(
  cod: number | null,
  _sigla: string,
  apiMap: Map<number, RdoAnalyticsMotivo>,
): string {
  if (cod != null) {
    const api = apiMap.get(cod);
    if (api?.produtivo === 'S') return 'wrenchTime';
    if (api?.wtCategoria) return api.wtCategoria;
  }
  return 'externos';
}

export interface ProductivityResult {
  totalProdMin: number;
  totalNaoProdMin: number;
  produtividadePercent: number;
  motivosProdutivos: string[];
  /** Jornada - tolerance deductions. Undefined if no jornada provided. */
  totalMetaEfetivaMin?: number;
  /** Total tolerance deducted from jornada (for display). */
  totalToleranciaDeducaoMin?: number;
  /** totalProdMin / totalMetaEfetivaMin × 100. How much of the expected work was done. */
  prodVsMetaPercent?: number;
}

/**
 * Compute aggregate productivity from post-tolerance motivo groups.
 * Uses the same base as treemap so all percentages are consistent.
 *
 * @param groups - Post-tolerance groups (from computeExcessGroups).
 * @param apiMap - Map from rdomotivocod to API motivo data (for produtivo/penalidadeMin).
 * @param baseGroups - Pre-tolerance groups (for meta efetiva deductions).
 * @param totalMinutosPrevistos - Jornada from TFPHOR.
 */
export function computeProductivityFromMotivos(
  groups: MotivoGroup[],
  apiMap: Map<number, RdoAnalyticsMotivo>,
  baseGroups: MotivoGroup[],
  totalMinutosPrevistos?: number,
): ProductivityResult {
  let totalProdMin = 0;
  let totalNaoProdMin = 0;
  const motivosProdutivos: string[] = [];

  for (const g of groups) {
    const isProdutivo = g.cod != null && apiMap.get(g.cod)?.produtivo === 'S';
    if (isProdutivo) {
      totalProdMin += g.totalMin;
      motivosProdutivos.push(g.sigla);
    } else {
      totalNaoProdMin += g.totalMin;
    }
  }

  // Apply fumar penalty if configured in API
  const fumarGroup = groups.find((g) => g.cod === 6);
  if (fumarGroup) {
    const fumarApi = apiMap.get(6);
    const pen = fumarApi?.penalidadeMin ?? 0;
    if (pen > 0) {
      const penalty = fumarGroup.count * pen;
      totalProdMin = Math.max(totalProdMin - penalty, 0);
    }
  }

  // Meta efetiva: jornada - tolerance deductions (uses BASE groups
  // because removed motivos like BANH still have rdosComMotivo data)
  let totalMetaEfetivaMin: number | undefined;
  let totalToleranciaDeducaoMin: number | undefined;
  if (totalMinutosPrevistos && totalMinutosPrevistos > 0) {
    let deducao = 0;
    for (const g of baseGroups) {
      if (g.cod == null) continue;
      const tolMin = apiMap.get(g.cod)?.tolerancia ?? 0;
      if (tolMin > 0 && (g.rdosComMotivo ?? 0) > 0) {
        deducao += (g.rdosComMotivo ?? 0) * tolMin;
      }
    }
    totalToleranciaDeducaoMin = deducao;
    totalMetaEfetivaMin = Math.max(totalMinutosPrevistos - deducao, 0);
  }

  // ALL percentages use meta efetiva (470min) as denominator when available.
  const denominator = (totalMetaEfetivaMin && totalMetaEfetivaMin > 0)
    ? totalMetaEfetivaMin
    : (totalProdMin + totalNaoProdMin);
  const produtividadePercent = denominator > 0
    ? Math.round((totalProdMin / denominator) * 100) : 0;
  const prodVsMetaPercent = (totalMetaEfetivaMin && totalMetaEfetivaMin > 0)
    ? produtividadePercent : undefined;

  return {
    totalProdMin, totalNaoProdMin, produtividadePercent,
    motivosProdutivos, totalMetaEfetivaMin, totalToleranciaDeducaoMin,
    prodVsMetaPercent,
  };
}

/**
 * Re-map .category on each group using the API wtCategoria/produtivo flag.
 * Generic to preserve ExcessGroup and other subtypes.
 * Returns a new array (does not mutate).
 */
export function computeConfigAwareGroups<T extends MotivoGroup>(
  groups: T[],
  apiMap: Map<number, RdoAnalyticsMotivo>,
): T[] {
  return groups.map((g) => {
    const api = g.cod != null ? apiMap.get(g.cod) : undefined;
    const category = categorizeWithConfig(g.cod, g.sigla, apiMap);
    const produtivo = api?.produtivo === 'S';
    return { ...g, category, produtivo };
  });
}
