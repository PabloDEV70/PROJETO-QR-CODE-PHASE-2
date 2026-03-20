/**
 * Dados de entrada do caso de uso ObterTabelaCompleta.
 *
 * @module Dicionario
 */
export interface ObterTabelaCompletaInput {
  /**
   * Token JWT do usuário autenticado.
   */
  tokenUsuario: string;

  /**
   * Nome da tabela a ser consultada.
   */
  nomeTabela: string;
}
