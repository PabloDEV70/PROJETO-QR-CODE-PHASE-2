/**
 * D4-T03: Input para ObterInstanciaCompletaUseCase
 *
 * Parâmetros de entrada para buscar uma instância com seus relacionamentos.
 */
export interface ObterInstanciaCompletaInput {
  /**
   * Nome da instância a ser buscada
   */
  nomeInstancia: string;

  /**
   * Token JWT do usuário autenticado
   */
  tokenUsuario: string;
}
