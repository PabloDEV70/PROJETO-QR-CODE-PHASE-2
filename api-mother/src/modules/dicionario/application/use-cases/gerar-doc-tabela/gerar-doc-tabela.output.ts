/**
 * Dados de saída do caso de uso GerarDocTabela.
 *
 * @module Dicionario
 */
export interface GerarDocTabelaOutput {
  /**
   * Conteúdo da documentação gerada.
   */
  conteudo: string;

  /**
   * Formato do documento.
   */
  formato: string;

  /**
   * Nome da tabela documentada.
   */
  nomeTabela: string;

  /**
   * Timestamp da geração.
   */
  geradoEm: Date;
}
