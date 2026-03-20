/**
 * Query para obter uma instância específica por nome.
 *
 * @module Dicionario
 * @tabela TDDINS
 */

/**
 * Parâmetros para obter instância por nome.
 */
export interface ObterInstanciaParametros {
  /** Nome da instância a buscar */
  nomeInstancia: string;
}

/**
 * Query para obter uma instância específica do dicionário de dados.
 *
 * Busca por nome exato da instância (case-insensitive via UPPER).
 *
 * @example
 * ```typescript
 * const query = new ObterInstanciaQuery({ nomeInstancia: 'Produto' });
 * const resultado = await sqlServer.executeSQL(query.sql, Object.values(query.parametros));
 * ```
 */
export class ObterInstanciaQuery {
  constructor(private readonly params: ObterInstanciaParametros) {
    if (!params.nomeInstancia || params.nomeInstancia.trim().length === 0) {
      throw new Error('Nome da instância é obrigatório');
    }
  }

  /**
   * Obtém o SQL da query.
   */
  get sql(): string {
    return `
      SELECT
        NOMEINSTANCIA as nomeInstancia,
        NOMETAB as nomeTabela,
        DESCRICAO as descricao,
        ORDEM as ordem,
        ATIVA as ativa
      FROM TDDINS
      WHERE UPPER(NOMEINSTANCIA) = UPPER(@nomeInstancia)
    `.trim();
  }

  /**
   * Obtém os parâmetros da query.
   */
  get parametros(): Record<string, unknown> {
    return {
      nomeInstancia: this.params.nomeInstancia.trim(),
    };
  }

  /** Tabelas consultadas pela query */
  readonly tabelas = ['TDDINS'];

  /** Campos retornados pela query */
  readonly campos = ['NOMEINSTANCIA', 'NOMETAB', 'DESCRICAO', 'ORDEM', 'ATIVA'];

  /** Descrição da query para documentação */
  readonly descricao = 'Busca instância específica por nome';
}
