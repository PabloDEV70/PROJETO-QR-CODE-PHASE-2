/**
 * Entity: Relacionamento
 *
 * Representa um relacionamento de chave estrangeira entre tabelas.
 */
export interface DadosRelacionamento {
  constraint_name: string;
  parent_schema: string;
  parent_table: string;
  parent_column: string;
  referenced_schema: string;
  referenced_table: string;
  referenced_column: string;
  delete_rule?: string;
  update_rule?: string;
}

export class Relacionamento {
  private constructor(
    public readonly nomeConstraint: string,
    public readonly schemaPai: string,
    public readonly tabelaPai: string,
    public readonly colunaPai: string,
    public readonly schemaReferenciado: string,
    public readonly tabelaReferenciada: string,
    public readonly colunaReferenciada: string,
    public readonly regraDelete: string,
    public readonly regraUpdate: string,
  ) {}

  static criar(dados: DadosRelacionamento): Relacionamento {
    return new Relacionamento(
      dados.constraint_name,
      dados.parent_schema,
      dados.parent_table,
      dados.parent_column,
      dados.referenced_schema,
      dados.referenced_table,
      dados.referenced_column,
      dados.delete_rule || 'NO ACTION',
      dados.update_rule || 'NO ACTION',
    );
  }

  /**
   * Retorna a tabela pai completa (schema.tabela)
   */
  obterTabelaPaiCompleta(): string {
    return `${this.schemaPai}.${this.tabelaPai}`;
  }

  /**
   * Retorna a tabela referenciada completa (schema.tabela)
   */
  obterTabelaReferenciadaCompleta(): string {
    return `${this.schemaReferenciado}.${this.tabelaReferenciada}`;
  }

  /**
   * Verifica se tem cascade em delete
   */
  temCascadeDelete(): boolean {
    return this.regraDelete.toUpperCase() === 'CASCADE';
  }

  /**
   * Verifica se tem cascade em update
   */
  temCascadeUpdate(): boolean {
    return this.regraUpdate.toUpperCase() === 'CASCADE';
  }

  /**
   * Retorna descrição do relacionamento
   */
  obterDescricao(): string {
    return `${this.obterTabelaPaiCompleta()}.${this.colunaPai} -> ${this.obterTabelaReferenciadaCompleta()}.${this.colunaReferenciada}`;
  }

  /**
   * Verifica se o relacionamento é auto-referenciado
   */
  ehAutoReferenciado(): boolean {
    return this.tabelaPai === this.tabelaReferenciada && this.schemaPai === this.schemaReferenciado;
  }
}
