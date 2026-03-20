/**
 * KPIs detalhados de manutenção para dashboard
 * Baseado no estudo de queries validadas contra PROD
 */
export interface OsKpis {
  totalAtivas: number;
  osAbertas: number;
  osEmExecucao: number;
  corretivas: number;
  preventivas: number;
  comBloqueioComercial: number;
  atrasadas: number;
  naoImpeditivas: number;
}
