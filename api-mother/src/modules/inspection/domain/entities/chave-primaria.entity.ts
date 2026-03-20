/**
 * Entity: ChavePrimaria
 *
 * Representa uma chave primária de uma tabela.
 */
export interface DadosChavePrimaria {
  TABLE_NAME: string;
  COLUMN_NAME: string;
  CONSTRAINT_NAME: string;
}

export class ChavePrimaria {
  private constructor(
    public readonly tabela: string,
    public readonly coluna: string,
    public readonly nomeConstraint: string,
  ) {}

  static criar(dados: DadosChavePrimaria): ChavePrimaria {
    return new ChavePrimaria(dados.TABLE_NAME, dados.COLUMN_NAME, dados.CONSTRAINT_NAME);
  }

  /**
   * Verifica se é chave primária padrão Sankhya (PK_)
   */
  ehPadraoSankhya(): boolean {
    return this.nomeConstraint.startsWith('PK_');
  }

  /**
   * Retorna descrição da chave primária
   */
  obterDescricao(): string {
    return `${this.tabela}.${this.coluna} (${this.nomeConstraint})`;
  }
}
