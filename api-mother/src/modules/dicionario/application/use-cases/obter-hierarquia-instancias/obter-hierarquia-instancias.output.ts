import { InstanciaDto } from '../../mappers/instancia.mapper';

/**
 * D4-T04: Nó da árvore de hierarquia
 */
export interface NodoHierarquia {
  /**
   * Dados da instância neste nível
   */
  instancia: InstanciaDto;

  /**
   * Tipo de ligação com o pai (se houver)
   */
  tipoLigacao?: string;

  /**
   * Descrição do tipo de ligação
   */
  tipoLigacaoDescricao?: string;

  /**
   * Nível na hierarquia (0 = raiz)
   */
  nivel: number;

  /**
   * Filhos (instâncias relacionadas)
   */
  filhos: NodoHierarquia[];
}

/**
 * D4-T04: Output para ObterHierarquiaInstanciasUseCase
 */
export interface ObterHierarquiaInstanciasOutput {
  /**
   * Árvore de hierarquia com a instância raiz
   */
  hierarquia: NodoHierarquia | null;

  /**
   * Total de instâncias na hierarquia
   */
  totalInstancias: number;

  /**
   * Profundidade máxima alcançada
   */
  profundidade: number;
}
