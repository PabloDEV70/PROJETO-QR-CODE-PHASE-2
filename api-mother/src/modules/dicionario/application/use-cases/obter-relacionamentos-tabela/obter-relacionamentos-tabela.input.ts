/**
 * DTO de entrada para o caso de uso ObterRelacionamentosTabelaUseCase
 *
 * Contém os parâmetros necessários para buscar relacionamentos de uma tabela
 */
export interface ObterRelacionamentosTabelaInput {
  /**
   * Nome da tabela para buscar relacionamentos
   */
  nomeTabela: string;

  /**
   * Token JWT do usuário autenticado
   */
  tokenUsuario: string;
}
