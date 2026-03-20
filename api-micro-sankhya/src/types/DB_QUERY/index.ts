export interface DbQueryRequest {
  query: string;
}

export interface DbQueryResult {
  linhas: Record<string, unknown>[];
  quantidadeLinhas: number;
  tempoExecucaoMs: number;
}
