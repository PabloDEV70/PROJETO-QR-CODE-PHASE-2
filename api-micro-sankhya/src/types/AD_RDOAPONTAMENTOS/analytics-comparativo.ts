export interface RdoPeriodMetrics {
  totalRdos: number;
  totalColaboradores: number;
  totalDetalhes: number;
  totalHoras: number;
  mediaMinutosPorItem: number;
  itensComOs: number;
  diasComDados: number;
}

export interface RdoComparativo {
  atual: RdoPeriodMetrics;
  anterior: RdoPeriodMetrics;
  deltas: {
    totalRdos: number;
    totalColaboradores: number;
    totalHoras: number;
    mediaMinutosPorItem: number;
    percentualComOs: number;
  };
}
