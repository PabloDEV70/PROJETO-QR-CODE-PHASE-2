/**
 * DTO de opção de campo.
 */
export interface OpcaoCampoDto {
  /**
   * Nome da tabela.
   */
  nomeTabela: string;

  /**
   * Nome do campo.
   */
  nomeCampo: string;

  /**
   * Valor da opção.
   */
  valor: string;

  /**
   * Descrição da opção.
   */
  descricao: string;

  /**
   * Ordem de exibição.
   */
  ordem: number;
}

/**
 * Dados de saída do caso de uso ObterOpcoesCampo.
 *
 * @module Dicionario
 */
export interface ObterOpcoesCampoOutput {
  /**
   * Lista de opções do campo.
   */
  opcoes: OpcaoCampoDto[];

  /**
   * Total de opções.
   */
  total: number;
}
