/**
 * Single source of truth for RDO dashboard derived metrics.
 * Combines raw API data into consistent KPI values — no Zustand config store.
 */
import { useMemo } from 'react';
import type { MotivoGroup } from '@/components/rdo/rdo-motivo-treemap';
import type { RdoAnalyticsMotivo } from '@/types/rdo-analytics-types';
import { computeExcessGroups, type ExcessResult } from '@/utils/rdo-filter-helpers';
import {
  computeConfigAwareGroups,
  computeProductivityFromMotivos,
  type ProductivityResult,
} from '@/utils/motivo-productivity';

export interface DashboardData {
  /** Motivo groups with API-driven categories + tolerance applied */
  groups: MotivoGroup[];
  /** Treemap result (groups after tolerance, totalMin, hasExcedentes) */
  treemap: ExcessResult;
  /** Total minutes BEFORE tolerance (raw sum of all motivos) */
  rawTotalMin: number;
  /** Productivity metrics derived from API data */
  productivity: ProductivityResult;
}

/**
 * Derive all dashboard metrics from raw motivo data.
 * Replaces the 3 scattered useMemo blocks in rdo-list-page.
 *
 * @param totalMinutosPrevistos - Jornada total from backend (TFPHOR).
 *   When provided, productivity.totalMetaEfetivaMin is computed by
 *   deducting API tolerances (e.g. banheiro 10min × RDOs that had it).
 */
export function useRdoDashboardData(
  apiMotivos: RdoAnalyticsMotivo[] | undefined,
  totalMinutosPrevistos?: number,
): DashboardData | null {
  return useMemo(() => {
    if (!apiMotivos?.length) return null;

    // Build lookup map for O(1) access to API motivo data
    const apiMap = new Map(apiMotivos.map((m) => [m.rdomotivocod, m]));

    // 1) Build base groups from API data (include rdosComMotivo)
    const baseGroups: MotivoGroup[] = apiMotivos
      .map((m) => ({
        sigla: m.sigla,
        descricao: m.descricao,
        cod: m.rdomotivocod,
        count: m.totalItens,
        rdosComMotivo: Number(m.rdosComMotivo) || 0,
        totalMin: Math.round(Number(m.totalHoras) * 60),
        category: m.wtCategoria ?? 'externos',
        produtivo: m.produtivo === 'S',
      }))
      .sort((a, b) => b.totalMin - a.totalMin);

    // 2) Raw total (pre-tolerance)
    const rawTotalMin = baseGroups.reduce((s, g) => s + g.totalMin, 0);

    // 3) Apply tolerance → treemap data (uses API tolerancia directly)
    const treemap = computeExcessGroups(baseGroups, apiMotivos);

    // 4) Re-classify categories using API produtivo flag
    const configAwareGroups = computeConfigAwareGroups(treemap.groups, apiMap);
    const treemapWithConfig: ExcessResult = {
      ...treemap,
      groups: configAwareGroups,
    };

    // 5) Compute productivity from POST-TOLERANCE groups
    //    Same base as treemap so all percentages are consistent.
    //    Pass baseGroups for meta efetiva (needs rdosComMotivo from removed motivos)
    const productivity = computeProductivityFromMotivos(
      configAwareGroups, apiMap, baseGroups, totalMinutosPrevistos,
    );

    return {
      groups: configAwareGroups,
      treemap: treemapWithConfig,
      rawTotalMin,
      productivity,
    };
  }, [apiMotivos, totalMinutosPrevistos]);
}
