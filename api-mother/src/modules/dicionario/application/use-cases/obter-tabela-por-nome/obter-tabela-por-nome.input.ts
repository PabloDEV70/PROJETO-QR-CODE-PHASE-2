/**
 * Dados de entrada para o caso de uso ObterTabelaPorNome.
 *
 * @module Dicionario
 */
export interface ObterTabelaPorNomeInput {
  /**
   * Nome da tabela a ser buscada (ex: TGFPRO, TGFCAB).
   */
  nomeTabela: string;

  /**
   * Token JWT do usuário autenticado para acesso à Remote API Sankhya.
   */
  tokenUsuario: string;
}
