/**
 * Dados de entrada do caso de uso ObterCampoCompleto.
 *
 * @module Dicionario
 */
export interface ObterCampoCompletoInput {
  /**
   * Token JWT do usuário autenticado.
   */
  tokenUsuario: string;

  /**
   * Nome da tabela do campo.
   */
  nomeTabela: string;

  /**
   * Nome do campo.
   */
  nomeCampo: string;
}
