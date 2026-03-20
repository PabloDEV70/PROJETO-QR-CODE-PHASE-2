/**
 * D4-T04: Input para ObterHierarquiaInstanciasUseCase
 *
 * Parâmetros de entrada para obter hierarquia de instâncias relacionadas.
 */
export interface ObterHierarquiaInstanciasInput {
  /**
   * Nome da instância raiz da hierarquia
   */
  nomeInstancia: string;

  /**
   * Token JWT do usuário autenticado
   */
  tokenUsuario: string;

  /**
   * Profundidade máxima da árvore (default: 3)
   */
  profundidadeMaxima?: number;
}
