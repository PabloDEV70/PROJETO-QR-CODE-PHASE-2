import { InstanciaDto } from '../../mappers/instancia.mapper';

/**
 * D4-T02: Output para ObterInstanciaUseCase
 *
 * Resultado contendo a instância encontrada ou null.
 */
export interface ObterInstanciaOutput {
  /**
   * Instância encontrada ou null se não existir
   */
  instancia: InstanciaDto | null;
}
