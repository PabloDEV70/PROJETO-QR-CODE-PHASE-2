/**
 * Query para obter tabela específica do dicionário de dados (TDDTAB).
 *
 * Busca uma tabela pelo nome exato.
 *
 * @module Dicionário
 * @tabelas TDDTAB
 * @task D2-T02
 */
export interface ObterTabelaParametros {
  nomeTabela: string;
}

export class ObterTabelaQuery {
  constructor(private readonly params: ObterTabelaParametros) {}

  /**
   * SQL da query.
   * Busca tabela por nome exato (case-insensitive tratado pelo parâmetro).
   */
  get sql(): string {
    return `
      SELECT
        NOMETAB,
        DESCRICAO,
        NOMEINSTANCIA,
        MODULO,
        ATIVA,
        TIPOCRUD
      FROM TDDTAB
      WHERE NOMETAB = @param1
    `;
  }

  /**
   * Parâmetros da query.
   */
  get parametros(): string[] {
    return [this.params.nomeTabela.toUpperCase()];
  }

  /**
   * Tabelas consultadas.
   */
  readonly tabelas = ['TDDTAB'];

  /**
   * Campos retornados pela query.
   */
  readonly campos = ['NOMETAB', 'DESCRICAO', 'NOMEINSTANCIA', 'MODULO', 'ATIVA', 'TIPOCRUD'];

  /**
   * Descrição da query para documentação.
   */
  readonly descricao = 'Obtém tabela específica do dicionário por nome';
}
