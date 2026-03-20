/**
 * Dados de entrada do caso de uso GerarDocTabela.
 *
 * @module Dicionario
 */
export interface GerarDocTabelaInput {
  /**
   * Token JWT do usuário autenticado.
   */
  tokenUsuario: string;

  /**
   * Nome da tabela.
   */
  nomeTabela: string;

  /**
   * Formato de saída.
   */
  formato: 'markdown' | 'html' | 'pdf';

  /**
   * Incluir campos na documentação.
   */
  incluirCampos?: boolean;
}
