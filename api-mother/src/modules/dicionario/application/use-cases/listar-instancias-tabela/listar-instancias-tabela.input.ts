/**
 * D4-T01: Input para ListarInstanciasTabelaUseCase
 *
 * Parâmetros de entrada para listar instâncias de uma tabela.
 */
export interface ListarInstanciasTabelaInput {
  /**
   * Nome da tabela para buscar instâncias
   */
  nomeTabela: string;

  /**
   * Token JWT do usuário autenticado
   */
  tokenUsuario: string;
}
