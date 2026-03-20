/**
 * Dados de entrada do caso de uso ObterPropriedadesCampo.
 *
 * @module Dicionario
 */
export interface ObterPropriedadesCampoInput {
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
