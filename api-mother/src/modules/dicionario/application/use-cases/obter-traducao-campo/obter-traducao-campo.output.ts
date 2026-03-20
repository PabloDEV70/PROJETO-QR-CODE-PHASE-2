/**
 * Dados de saída do caso de uso ObterTraducaoCampo.
 *
 * @module Dicionario
 */
export interface ObterTraducaoCampoOutput {
  /**
   * Nome da tabela.
   */
  nomeTabela: string;

  /**
   * Nome do campo.
   */
  nomeCampo: string;

  /**
   * Idioma da tradução.
   */
  idioma: string;

  /**
   * Descrição traduzida.
   */
  descricaoTraduzida: string | null;

  /**
   * Descrição resumida traduzida.
   */
  descricaoResumidaTraduzida: string | null;

  /**
   * Indica se tradução foi encontrada.
   */
  encontrada: boolean;
}
