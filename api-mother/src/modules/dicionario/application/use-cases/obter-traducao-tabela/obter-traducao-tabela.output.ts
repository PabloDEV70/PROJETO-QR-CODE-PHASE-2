/**
 * Dados de saída do caso de uso ObterTraducaoTabela.
 *
 * @module Dicionario
 */
export interface ObterTraducaoTabelaOutput {
  /**
   * Nome da tabela.
   */
  nomeTabela: string;

  /**
   * Idioma da tradução.
   */
  idioma: string;

  /**
   * Descrição traduzida.
   */
  descricaoTraduzida: string | null;

  /**
   * Indica se tradução foi encontrada.
   */
  encontrada: boolean;
}
