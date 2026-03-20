export interface ExecutorRankingRow {
  CODUSU: number;
  nomeExecutor: string;
  totalOS: number;
  totalServicos: number;
  servicosConcluidos: number;
  taxaConclusao: number;
  tempoMedioMin: number;
}

export interface ExecutorRankingOptions {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface ExecutorRankingResponse {
  period: {
    startDate: string;
    endDate: string;
  };
  data: ExecutorRankingRow[];
}
