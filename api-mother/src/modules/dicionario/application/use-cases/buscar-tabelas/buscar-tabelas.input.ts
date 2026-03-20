/**
 * Dados de entrada do caso de uso BuscarTabelas.
 *
 * @module Dicionario
 */
export interface BuscarTabelasInput {
  /**
   * Token JWT do usuário autenticado.
   */
  tokenUsuario: string;

  /**
   * Termo de busca para nome e descrição.
   */
  termo: string;
}
