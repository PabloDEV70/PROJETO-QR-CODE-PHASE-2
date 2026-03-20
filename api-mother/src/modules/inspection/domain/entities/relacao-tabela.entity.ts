/**
 * Entity: RelacaoTabela
 *
 * Representa um relacionamento de chave estrangeira de uma tabela.
 */
export interface DadosRelacaoTabela {
  ForeignKeyName: string;
  ParentTable: string;
  ParentColumn: string;
  ReferencedTable: string;
  ReferencedColumn: string;
  DeleteAction: string;
  UpdateAction: string;
}

export class RelacaoTabela {
  private constructor(
    public readonly nomeForeignKey: string,
    public readonly tabelaPai: string,
    public readonly colunaPai: string,
    public readonly tabelaReferenciada: string,
    public readonly colunaReferenciada: string,
    public readonly acaoDelete: string,
    public readonly acaoUpdate: string,
  ) {}

  static criar(dados: DadosRelacaoTabela): RelacaoTabela {
    return new RelacaoTabela(
      dados.ForeignKeyName,
      dados.ParentTable,
      dados.ParentColumn,
      dados.ReferencedTable,
      dados.ReferencedColumn,
      dados.DeleteAction,
      dados.UpdateAction,
    );
  }

  /**
   * Verifica se tem cascade em delete
   */
  temCascadeDelete(): boolean {
    return this.acaoDelete.toUpperCase() === 'CASCADE';
  }

  /**
   * Verifica se tem cascade em update
   */
  temCascadeUpdate(): boolean {
    return this.acaoUpdate.toUpperCase() === 'CASCADE';
  }

  /**
   * Retorna descrição do relacionamento
   */
  obterDescricao(): string {
    return `${this.tabelaPai}.${this.colunaPai} -> ${this.tabelaReferenciada}.${this.colunaReferenciada}`;
  }

  /**
   * Verifica se é auto-referenciado
   */
  ehAutoReferenciado(): boolean {
    return this.tabelaPai === this.tabelaReferenciada;
  }
}
