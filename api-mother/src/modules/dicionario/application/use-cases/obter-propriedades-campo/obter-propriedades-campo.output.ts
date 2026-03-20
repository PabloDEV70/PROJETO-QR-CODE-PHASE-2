/**
 * DTO de propriedade de campo.
 */
export interface PropriedadeCampoDto {
  /**
   * Nome da tabela.
   */
  nomeTabela: string;

  /**
   * Nome do campo.
   */
  nomeCampo: string;

  /**
   * Nome da propriedade.
   */
  nomePropriedade: string;

  /**
   * Valor da propriedade.
   */
  valorPropriedade: string;

  /**
   * Valor como booleano (para propriedades S/N).
   */
  valorBooleano: boolean;
}

/**
 * Dados de saída do caso de uso ObterPropriedadesCampo.
 *
 * @module Dicionario
 */
export interface ObterPropriedadesCampoOutput {
  /**
   * Lista de propriedades do campo.
   */
  propriedades: PropriedadeCampoDto[];

  /**
   * Total de propriedades.
   */
  total: number;
}
