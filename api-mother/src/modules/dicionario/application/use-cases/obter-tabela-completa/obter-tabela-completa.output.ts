import { TabelaDto } from '../../mappers/tabela.mapper';

/**
 * Dados de saída do caso de uso ObterTabelaCompleta.
 *
 * Inclui informações detalhadas da tabela com contagem de campos e instâncias.
 *
 * @module Dicionario
 */
export interface TabelaCompletaDto extends TabelaDto {
  /**
   * Quantidade de campos da tabela.
   */
  quantidadeCampos: number;

  /**
   * Quantidade de instâncias da tabela.
   */
  quantidadeInstancias: number;
}

export interface ObterTabelaCompletaOutput {
  /**
   * Tabela com informações completas, ou null se não encontrada.
   */
  tabela: TabelaCompletaDto | null;
}
