/**
 * DTO de entrada para o caso de uso ObterInstanciasTabelaUseCase
 *
 * Contém os parâmetros necessários para buscar instâncias de uma tabela
 */
export interface ObterInstanciasTabelaInput {
  /**
   * Nome da tabela para buscar instâncias
   */
  nomeTabela: string;

  /**
   * Token JWT do usuário autenticado
   */
  tokenUsuario: string;
}
