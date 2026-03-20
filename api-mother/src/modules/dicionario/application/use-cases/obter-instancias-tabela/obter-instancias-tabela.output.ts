import { InstanciaDto } from '../../mappers/instancia.mapper';

/**
 * DTO de saída para o caso de uso ObterInstanciasTabelaUseCase
 *
 * Contém a lista de instâncias encontradas e metadados
 */
export interface ObterInstanciasTabelaOutput {
  /**
   * Lista de instâncias da tabela
   */
  instancias: InstanciaDto[];

  /**
   * Total de instâncias encontradas
   */
  total: number;
}
