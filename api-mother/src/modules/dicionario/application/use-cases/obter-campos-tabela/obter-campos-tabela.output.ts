import { CampoDto } from '../../mappers/campo.mapper';

/**
 * Dados de saída do caso de uso ObterCamposTabela.
 *
 * @module Dicionario
 */
export interface ObterCamposTabelaOutput {
  /**
   * Lista de campos da tabela.
   */
  campos: CampoDto[];

  /**
   * Total de campos retornados.
   */
  total: number;
}
