/**
 * Dados de entrada do caso de uso InvalidarCache.
 *
 * @module Dicionario
 */
export interface InvalidarCacheInput {
  /**
   * Token JWT do usuário autenticado (admin).
   */
  tokenUsuario: string;

  /**
   * Tipo de invalidação.
   */
  tipo: 'tudo' | 'tabela' | 'campo' | 'opcoes';

  /**
   * Nome da tabela (quando tipo = 'tabela', 'campo' ou 'opcoes').
   */
  nomeTabela?: string;

  /**
   * Nome do campo (quando tipo = 'campo' ou 'opcoes').
   */
  nomeCampo?: string;
}
