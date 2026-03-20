/**
 * Dashboard KPIs consolidados - API-07, API-08, API-09
 * Unifica totalOS, MTTR, MTBF, status distribution, type distribution
 */

/**
 * Raw row from dashboardKpisUnified query
 */
export interface DashboardKpisRow {
  totalOS: number;
  mttrHoras: number | null;
  statusAberta: number;
  statusEmExecucao: number;
  statusFinalizada: number;
  statusCancelada: number;
  tipoCorretiva: number;
  tipoPreventiva: number;
  tipoOutros: number;
}

/**
 * Row from mtbfByVehicle query
 */
export interface MtbfByVehicle {
  CODVEICULO: number;
  PLACA: string | null;
  mtbfDias: number | null;
  totalFalhas: number;
}

/**
 * Final dashboard KPIs response
 */
export interface OsDashboardKpis {
  totalOS: number;
  mttrHoras: number | null;
  mtbfDias: number | null;
  statusDistribution: {
    aberta: number;
    emExecucao: number;
    finalizada: number;
    cancelada: number;
  };
  typeDistribution: {
    corretiva: number;
    preventiva: number;
    outros: number;
  };
  mtbfByVehicle: MtbfByVehicle[];
}
