/**
 * D4-T06: Input para ObterCamposRelacionamentoUseCase
 *
 * Parâmetros de entrada para buscar campos de ligação de um relacionamento.
 */
export interface ObterCamposRelacionamentoInput {
  /**
   * Nome da instância pai do relacionamento
   */
  nomeInstanciaPai: string;

  /**
   * Nome da instância filha do relacionamento
   */
  nomeInstanciaFilho: string;

  /**
   * Token JWT do usuário autenticado
   */
  tokenUsuario: string;
}
