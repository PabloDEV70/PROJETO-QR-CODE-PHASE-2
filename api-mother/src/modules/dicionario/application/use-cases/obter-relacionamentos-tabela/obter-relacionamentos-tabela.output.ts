import { RelacionamentoDto } from '../../mappers/relacionamento.mapper';

/**
 * DTO de saída para o caso de uso ObterRelacionamentosTabelaUseCase
 *
 * Contém a lista de relacionamentos encontrados e metadados
 */
export interface ObterRelacionamentosTabelaOutput {
  /**
   * Lista de relacionamentos da tabela
   */
  relacionamentos: RelacionamentoDto[];

  /**
   * Total de relacionamentos encontrados
   */
  total: number;
}
