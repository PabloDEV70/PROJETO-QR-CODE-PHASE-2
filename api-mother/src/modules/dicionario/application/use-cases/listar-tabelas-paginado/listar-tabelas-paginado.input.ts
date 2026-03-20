/**
 * Dados de entrada do caso de uso ListarTabelasPaginado.
 *
 * @module Dicionario
 */
export interface ListarTabelasPaginadoInput {
  /**
   * Token JWT do usuário autenticado.
   */
  tokenUsuario: string;

  /**
   * Número da página (1-indexed).
   * @default 1
   */
  page?: number;

  /**
   * Limite de registros por página.
   * @default 20
   */
  limit?: number;
}
