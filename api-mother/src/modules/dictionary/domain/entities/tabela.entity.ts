/**
 * Entidade de Domínio: Tabela
 *
 * Representa uma tabela do dicionário de dados Sankhya (TDDTAB).
 * Imutável - todos os valores são readonly.
 *
 * @module dictionary-v2
 */
export class Tabela {
  private constructor(
    public readonly nomeTabela: string,
    public readonly descricao: string,
    public readonly tipoNumeracao: string | null,
    public readonly numeroCampoNumeracao: number | null,
    public readonly adicional: string | null,
  ) {
    if (!nomeTabela || nomeTabela.trim() === '') {
      throw new Error('Nome da tabela é obrigatório');
    }
  }

  /**
   * Factory method para criar Tabela a partir de dados do banco
   */
  static criar(dados: {
    NOMETAB: string;
    DESCRTAB: string;
    TIPONUMERACAO?: string | null;
    NUCAMPONUMERACAO?: number | null;
    ADICIONAL?: string | null;
  }): Tabela {
    return new Tabela(
      dados.NOMETAB,
      dados.DESCRTAB || '',
      dados.TIPONUMERACAO || null,
      dados.NUCAMPONUMERACAO || null,
      dados.ADICIONAL || null,
    );
  }

  /**
   * Verifica se a tabela tem numeração automática
   */
  temNumeracaoAutomatica(): boolean {
    return this.tipoNumeracao !== null && this.numeroCampoNumeracao !== null;
  }
}
