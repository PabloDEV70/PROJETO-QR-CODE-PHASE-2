import { CampoDto } from '../../mappers/campo.mapper';

/**
 * Dados de saída do caso de uso ObterCampo.
 *
 * @module Dicionario
 */
export interface ObterCampoOutput {
  /**
   * Campo encontrado, ou null se não existir.
   */
  campo: CampoDto | null;
}
