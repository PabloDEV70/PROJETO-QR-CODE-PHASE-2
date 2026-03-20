/**
 * D4-T07: Input para ObterTabelasRelacionadasUseCase
 *
 * Parâmetros de entrada para obter grafo de tabelas relacionadas.
 */
export interface ObterTabelasRelacionadasInput {
  /**
   * Nome da tabela central do grafo
   */
  nomeTabela: string;

  /**
   * Token JWT do usuário autenticado
   */
  tokenUsuario: string;

  /**
   * Profundidade máxima do grafo (default: 2)
   */
  profundidadeMaxima?: number;
}
