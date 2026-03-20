import { TabelaDto } from '../../mappers/tabela.mapper';

/**
 * Dados de saída do caso de uso ListarTabelasPaginado.
 *
 * @module Dicionario
 */
export interface ListarTabelasPaginadoOutput {
  /**
   * Lista de tabelas da página atual.
   */
  tabelas: TabelaDto[];

  /**
   * Total de tabelas disponíveis.
   */
  total: number;

  /**
   * Número da página atual.
   */
  page: number;

  /**
   * Limite de registros por página.
   */
  limit: number;

  /**
   * Total de páginas disponíveis.
   */
  totalPages: number;
}
