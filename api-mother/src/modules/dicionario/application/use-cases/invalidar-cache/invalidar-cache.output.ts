/**
 * Dados de saída do caso de uso InvalidarCache.
 *
 * @module Dicionario
 */
export interface InvalidarCacheOutput {
  /**
   * Mensagem de confirmação.
   */
  mensagem: string;

  /**
   * Tipo de invalidação realizada.
   */
  tipo: string;

  /**
   * Timestamp da invalidação.
   */
  timestamp: Date;
}
