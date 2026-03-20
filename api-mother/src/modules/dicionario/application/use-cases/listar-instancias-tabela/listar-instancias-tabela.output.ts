import { InstanciaDto } from '../../mappers/instancia.mapper';

/**
 * D4-T01: Output para ListarInstanciasTabelaUseCase
 *
 * Resultado contendo lista de instâncias de uma tabela.
 */
export interface ListarInstanciasTabelaOutput {
  /**
   * Lista de instâncias da tabela
   */
  instancias: InstanciaDto[];

  /**
   * Total de instâncias encontradas
   */
  total: number;
}
