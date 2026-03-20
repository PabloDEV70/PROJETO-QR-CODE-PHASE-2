/**
 * Dados de entrada do caso de uso ObterCampo.
 *
 * @module Dicionario
 */
export interface ObterCampoInput {
  /**
   * Token JWT do usuário autenticado.
   */
  tokenUsuario: string;

  /**
   * Nome da tabela do campo.
   */
  nomeTabela: string;

  /**
   * Nome do campo a ser consultado.
   */
  nomeCampo: string;
}
