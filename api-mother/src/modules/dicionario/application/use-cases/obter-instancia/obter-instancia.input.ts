/**
 * D4-T02: Input para ObterInstanciaUseCase
 *
 * Parâmetros de entrada para buscar uma instância específica.
 */
export interface ObterInstanciaInput {
  /**
   * Nome da instância a ser buscada
   */
  nomeInstancia: string;

  /**
   * Token JWT do usuário autenticado
   */
  tokenUsuario: string;
}
