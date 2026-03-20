/**
 * Entity: Tabela
 *
 * Representa uma tabela do banco de dados.
 */
export interface DadosTabela {
  TABLE_NAME: string;
  TABLE_TYPE: string;
}

export class Tabela {
  private constructor(
    public readonly nome: string,
    public readonly tipo: string,
  ) {}

  static criar(dados: DadosTabela): Tabela {
    return new Tabela(dados.TABLE_NAME, dados.TABLE_TYPE);
  }

  /**
   * Verifica se é uma tabela de sistema
   */
  ehTabelaSistema(): boolean {
    return this.nome.startsWith('sys') || this.nome.startsWith('INFORMATION_SCHEMA');
  }

  /**
   * Verifica se é tabela Sankhya (AD_ ou TGF/TDD/TSI/TFP)
   */
  ehTabelaSankhya(): boolean {
    return (
      this.nome.startsWith('AD_') ||
      this.nome.startsWith('TGF') ||
      this.nome.startsWith('TDD') ||
      this.nome.startsWith('TSI') ||
      this.nome.startsWith('TFP')
    );
  }

  /**
   * Verifica se é tabela customizada (AD_)
   */
  ehTabelaCustomizada(): boolean {
    return this.nome.startsWith('AD_');
  }
}
