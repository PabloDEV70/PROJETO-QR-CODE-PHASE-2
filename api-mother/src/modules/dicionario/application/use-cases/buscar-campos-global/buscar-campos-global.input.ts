/**
 * Dados de entrada do caso de uso BuscarCamposGlobal.
 *
 * @module Dicionario
 */
export interface BuscarCamposGlobalInput {
  /**
   * Token JWT do usuário autenticado.
   */
  tokenUsuario: string;

  /**
   * Termo de busca para nome e descrição do campo.
   */
  termo: string;
}
