import { InstanciaDto } from '../../mappers/instancia.mapper';
import { RelacionamentoDto } from '../../mappers/relacionamento.mapper';

/**
 * D4-T03: Output para ObterInstanciaCompletaUseCase
 *
 * Resultado contendo a instância com seus links de relacionamentos.
 */
export interface InstanciaCompletaDto extends InstanciaDto {
  /**
   * Relacionamentos onde esta instância é pai (origem)
   */
  relacionamentosPai: RelacionamentoDto[];

  /**
   * Relacionamentos onde esta instância é filha (destino)
   */
  relacionamentosFilho: RelacionamentoDto[];

  /**
   * Total de relacionamentos
   */
  totalRelacionamentos: number;
}

export interface ObterInstanciaCompletaOutput {
  /**
   * Instância completa com relacionamentos ou null se não existir
   */
  instancia: InstanciaCompletaDto | null;
}
