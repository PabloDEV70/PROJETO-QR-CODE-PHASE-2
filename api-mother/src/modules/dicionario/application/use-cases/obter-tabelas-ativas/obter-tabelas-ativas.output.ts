import { TabelaDto } from '../../mappers/tabela.mapper';

/**
 * Dados de saída do caso de uso ObterTabelasAtivas.
 *
 * @module Dicionario
 */
export interface ObterTabelasAtivasOutput {
  /**
   * Lista de tabelas ativas do dicionário de dados.
   */
  tabelas: TabelaDto[];

  /**
   * Total de tabelas retornadas.
   */
  total: number;
}
