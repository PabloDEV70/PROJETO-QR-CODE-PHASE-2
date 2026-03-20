// Barrel re-export — keeps existing imports working.
// Prefer importing directly from rdo-core or rdo-analytics.
export {
  getRdoList,
  getRdoById,
  getRdoDetalhesById,
  getRdoDetalhes,
  getRdoMetricas,
  getColaboradorTimeline,
  searchFuncionarios,
} from '@/api/rdo-core';

export {
  getRdoAnalyticsResumo,
  getRdoAnalyticsProdutividade,
  getRdoAnalyticsMotivos,
  getRdoTimeline,
  getRdoTimelineMotivos,
  getRdoComparativo,
  getRdoEficiencia,
  getRdoFiltrosOpcoes,
  getRdoHoraExtra,
  getRdoAssiduidade,
  getRdoAnomalias,
  getRdoRanking,
  getRdoOvertimeRanking,
} from '@/api/rdo-analytics';
