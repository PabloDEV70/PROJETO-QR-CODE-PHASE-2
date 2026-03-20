import type { RdoListItem } from '@/types/rdo-types';
import type { WtDeductions } from '@/types/wrench-time-types';

/**
 * Maps a single-RDO RdoListItem (from /rdo/:id/metricas) into the same
 * WtDeductions shape used by the wrench-time aggregate page.
 *
 * This ensures the WtCalcDebug component displays consistent info
 * on both the wrench-time dashboard and the RDO detail page.
 */
export function buildDeductionsFromRdo(m: RdoListItem): WtDeductions {
  return {
    almocoTotalMin: m.almocoMin,
    almocoProgramadoMin: m.intervaloAlmocoMin,
    almocoExcessoMin: Math.max(0, m.almocoMin - m.almocoDescontadoMin),
    banheiroTotalMin: m.banheiroMin,
    banheiroToleranciaMin: m.banheiroDescontadoMin,
    banheiroExcessoMin: Math.max(0, m.banheiroMin - m.banheiroDescontadoMin),
    totalRdos: 1,
    totalBrutoMin: m.totalBrutoMin,
    baseEfetivaMin: m.tempoNoTrabalho,
  };
}
