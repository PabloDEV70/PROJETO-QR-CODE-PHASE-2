/**
 * Dados de entrada para o caso de uso ObterCamposTabela.
 *
 * @module Dicionario
 */
export interface ObterCamposTabelaInput {
  /**
   * Nome da tabela para buscar os campos (ex: TGFPRO, TGFCAB).
   */
  nomeTabela: string;

  /**
   * Token JWT do usuário autenticado para acesso à Remote API Sankhya.
   */
  tokenUsuario: string;
}
