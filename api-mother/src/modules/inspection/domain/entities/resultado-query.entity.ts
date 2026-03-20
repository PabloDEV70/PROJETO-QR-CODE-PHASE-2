/**
 * Entity: ResultadoQuery
 *
 * Representa o resultado de uma query executada.
 */
export interface DadosResultadoQuery {
  query: string;
  params: unknown[];
  data: unknown[];
  rowCount: number;
  executionTime?: number;
}

export class ResultadoQuery {
  private constructor(
    public readonly query: string,
    public readonly parametros: unknown[],
    public readonly dados: unknown[],
    public readonly quantidadeLinhas: number,
    public readonly tempoExecucao: number | null,
  ) {}

  static criar(dados: DadosResultadoQuery): ResultadoQuery {
    return new ResultadoQuery(dados.query, dados.params, dados.data, dados.rowCount, dados.executionTime || null);
  }

  /**
   * Verifica se a query retornou dados
   */
  temDados(): boolean {
    return this.quantidadeLinhas > 0;
  }

  /**
   * Verifica se a query está vazia
   */
  estaVazia(): boolean {
    return this.quantidadeLinhas === 0;
  }

  /**
   * Verifica se tem muitos resultados (>1000)
   */
  temMuitosResultados(): boolean {
    return this.quantidadeLinhas > 1000;
  }

  /**
   * Retorna resumo da execução
   */
  obterResumo(): string {
    const tempo = this.tempoExecucao ? `${this.tempoExecucao}ms` : 'N/A';
    return `${this.quantidadeLinhas} registros em ${tempo}`;
  }
}
