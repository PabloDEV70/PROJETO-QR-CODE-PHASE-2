import { TabelaDto } from '../../mappers/tabela.mapper';

/**
 * Dados de saída do caso de uso ObterTabelaPorNome.
 *
 * @module Dicionario
 */
export interface ObterTabelaPorNomeOutput {
  /**
   * Dados da tabela encontrada ou null se não existir.
   */
  tabela: TabelaDto | null;
}
