/**
 * D4-T05: Input para ListarRelacionamentosUseCase
 *
 * Parâmetros de entrada para listar relacionamentos de uma tabela.
 */
export interface ListarRelacionamentosInput {
  /**
   * Nome da tabela para buscar relacionamentos
   */
  nomeTabela: string;

  /**
   * Token JWT do usuário autenticado
   */
  tokenUsuario: string;

  /**
   * Filtrar apenas relacionamentos ativos (default: true)
   */
  apenasAtivos?: boolean;
}
