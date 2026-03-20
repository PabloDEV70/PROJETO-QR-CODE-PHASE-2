import { CampoDto } from '../../mappers/campo.mapper';

/**
 * Dados de saída do caso de uso BuscarCamposGlobal.
 *
 * @module Dicionario
 */
export interface BuscarCamposGlobalOutput {
  /**
   * Lista de campos encontrados em todas as tabelas.
   */
  campos: CampoDto[];

  /**
   * Total de campos encontrados.
   */
  total: number;

  /**
   * Termo utilizado na busca.
   */
  termo: string;
}
