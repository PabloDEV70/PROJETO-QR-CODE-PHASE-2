/**
 * Entity: ResumoDatabase
 *
 * Representa o resumo estatístico do banco de dados.
 */
export interface DadosResumoDatabase {
  total_tables: number;
  total_views: number;
  total_triggers: number;
  total_procedures: number;
  total_size_mb: number;
  data_size_mb: number;
  index_size_mb: number;
  unused_size_mb: number;
}

export class ResumoDatabase {
  private constructor(
    public readonly totalTabelas: number,
    public readonly totalViews: number,
    public readonly totalTriggers: number,
    public readonly totalProcedures: number,
    public readonly tamanhoTotalMb: number,
    public readonly tamanhoDadosMb: number,
    public readonly tamanhoIndicesMb: number,
    public readonly tamanhoNaoUsadoMb: number,
  ) {}

  static criar(dados: DadosResumoDatabase): ResumoDatabase {
    return new ResumoDatabase(
      dados.total_tables,
      dados.total_views,
      dados.total_triggers,
      dados.total_procedures,
      dados.total_size_mb,
      dados.data_size_mb,
      dados.index_size_mb,
      dados.unused_size_mb,
    );
  }

  /**
   * Calcula a porcentagem de espaço utilizado
   */
  obterPorcentagemUtilizada(): number {
    if (this.tamanhoTotalMb === 0) return 0;
    return Math.round(((this.tamanhoDadosMb + this.tamanhoIndicesMb) / this.tamanhoTotalMb) * 100);
  }

  /**
   * Verifica se o banco tem muitos objetos
   */
  temMuitosObjetos(): boolean {
    const totalObjetos = this.totalTabelas + this.totalViews + this.totalTriggers + this.totalProcedures;
    return totalObjetos > 1000;
  }

  /**
   * Retorna estatísticas formatadas
   */
  obterEstatisticasFormatadas(): Record<string, string> {
    return {
      tabelas: `${this.totalTabelas} tabelas`,
      views: `${this.totalViews} views`,
      triggers: `${this.totalTriggers} triggers`,
      procedures: `${this.totalProcedures} procedures`,
      tamanhoTotal: `${this.tamanhoTotalMb.toFixed(2)} MB`,
    };
  }
}
