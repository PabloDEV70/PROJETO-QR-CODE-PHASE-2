/**
 * Dados de entrada do caso de uso ObterTraducaoTabela.
 *
 * @module Dicionario
 */
export interface ObterTraducaoTabelaInput {
  /**
   * Token JWT do usuário autenticado.
   */
  tokenUsuario: string;

  /**
   * Nome da tabela.
   */
  nomeTabela: string;

  /**
   * Idioma desejado (pt-BR, en-US, es-ES).
   */
  idioma?: string;
}
