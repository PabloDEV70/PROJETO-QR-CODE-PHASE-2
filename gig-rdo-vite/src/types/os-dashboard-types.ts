export interface MtbfByVehicle {
  CODVEICULO: number;
  PLACA: string | null;
  mtbfDias: number | null;
  totalFalhas: number;
}

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
