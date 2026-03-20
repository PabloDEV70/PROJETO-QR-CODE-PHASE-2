import { RelacionamentoDto } from '../../mappers/relacionamento.mapper';

/**
 * D4-T05: Output para ListarRelacionamentosUseCase
 *
 * Resultado contendo relacionamentos categorizados.
 */
export interface ListarRelacionamentosOutput {
  /**
   * Relacionamentos onde tabelas da tabela são pai (origem)
   */
  relacionamentosPai: RelacionamentoDto[];

  /**
   * Relacionamentos onde tabelas da tabela são filha (destino)
   */
  relacionamentosFilho: RelacionamentoDto[];

  /**
   * Todos os relacionamentos (união sem duplicatas)
   */
  relacionamentos: RelacionamentoDto[];

  /**
   * Total de relacionamentos únicos
   */
  total: number;

  /**
   * Total como pai
   */
  totalComoPai: number;

  /**
   * Total como filho
   */
  totalComoFilho: number;
}
