import { TabelaDto } from '../../mappers/tabela.mapper';

/**
 * Dados de saída do caso de uso BuscarTabelas.
 *
 * @module Dicionario
 */
export interface BuscarTabelasOutput {
  /**
   * Lista de tabelas encontradas.
   */
  tabelas: TabelaDto[];

  /**
   * Total de tabelas encontradas.
   */
  total: number;

  /**
   * Termo utilizado na busca.
   */
  termo: string;
}
