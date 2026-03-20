export interface ExecutorRankingRow {
  CODUSU: number;
  nomeExecutor: string;
  totalOS: number;
  totalServicos: number;
  servicosConcluidos: number;
  taxaConclusao: number | null;
  tempoMedioMin: number | null;
}

export interface ExecutorRankingResponse {
  data: ExecutorRankingRow[];
  period: {
    startDate: string;
    endDate: string;
  };
}
