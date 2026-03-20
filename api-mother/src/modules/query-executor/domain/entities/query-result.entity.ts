/**
 * Entidade de domínio para resultado de query
 */
export class ResultadoQuery {
  constructor(
    public readonly linhas: any[],
    public readonly quantidadeLinhas: number,
    public readonly tempoExecucaoMs: number,
    public readonly colunas?: string[],
  ) {}

  public obterLinhas(): any[] {
    return this.linhas;
  }

  public obterQuantidadeLinhas(): number {
    return this.quantidadeLinhas;
  }

  public obterTempoExecucao(): number {
    return this.tempoExecucaoMs;
  }

  public obterColunas(): string[] | undefined {
    return this.colunas;
  }

  public possuiResultados(): boolean {
    return this.quantidadeLinhas > 0;
  }
}
