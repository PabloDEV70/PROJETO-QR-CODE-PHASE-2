/**
 * Dados de entrada do caso de uso ObterTraducaoCampo.
 *
 * @module Dicionario
 */
export interface ObterTraducaoCampoInput {
  /**
   * Token JWT do usuário autenticado.
   */
  tokenUsuario: string;

  /**
   * Nome da tabela.
   */
  nomeTabela: string;

  /**
   * Nome do campo.
   */
  nomeCampo: string;

  /**
   * Idioma desejado (pt-BR, en-US, es-ES).
   */
  idioma?: string;
}
