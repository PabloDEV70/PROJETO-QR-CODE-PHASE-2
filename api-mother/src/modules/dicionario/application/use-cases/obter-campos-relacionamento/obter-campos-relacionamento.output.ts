import { LinkCampoDto, RelacionamentoDto } from '../../mappers/relacionamento.mapper';

/**
 * D4-T06: Output para ObterCamposRelacionamentoUseCase
 *
 * Resultado contendo campos de ligação (TDDLGC) de um relacionamento.
 */
export interface ObterCamposRelacionamentoOutput {
  /**
   * Dados do relacionamento
   */
  relacionamento: RelacionamentoDto | null;

  /**
   * Campos de ligação (TDDLGC)
   */
  camposLigacao: LinkCampoDto[];

  /**
   * Expressão JOIN completa gerada
   */
  expressaoJoin: string;

  /**
   * Total de campos de ligação
   */
  total: number;
}
