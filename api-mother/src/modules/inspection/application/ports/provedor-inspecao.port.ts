/**
 * Ports: Provedores de Inspeção
 *
 * Interfaces para os provedores de inspeção do banco de dados.
 */
import { Tabela, ColunaTabela, RelacaoTabela, ChavePrimaria, ResultadoQuery } from '../../domain/entities';

/**
 * Resultado da lista de tabelas
 */
export interface ResultadoListaTabelas {
  tabelas: Tabela[];
  total: number;
}

/**
 * Resultado das relações de uma tabela
 */
export interface ResultadoRelacoes {
  nomeTabela: string;
  relacoes: RelacaoTabela[];
  total: number;
}

/**
 * Resultado das chaves primárias
 */
export interface ResultadoChavesPrimarias {
  nomeTabela: string;
  chaves: ChavePrimaria[];
  total: number;
}

/**
 * Entrada para execução de query
 */
export interface EntradaQuery {
  query: string;
  params: unknown[];
}

/**
 * Interface para consulta de tabelas
 */
export interface IProvedorTabelas {
  /**
   * Lista todas as tabelas do banco
   */
  listarTabelas(): Promise<ResultadoListaTabelas>;

  /**
   * Obtém schema de uma tabela (colunas)
   */
  obterSchemaTabela(nomeTabela: string): Promise<ColunaTabela[]>;
}

/**
 * Interface para consulta de relacionamentos
 */
export interface IProvedorRelacoes {
  /**
   * Obtém relacionamentos FK de uma tabela
   */
  obterRelacoes(nomeTabela: string): Promise<ResultadoRelacoes>;

  /**
   * Obtém chaves primárias de uma tabela
   */
  obterChavesPrimarias(nomeTabela: string): Promise<ResultadoChavesPrimarias>;
}

/**
 * Interface para execução de queries
 */
export interface IProvedorQuery {
  /**
   * Executa uma query SQL (apenas SELECT)
   */
  executarQuery(entrada: EntradaQuery): Promise<ResultadoQuery>;
}

// Símbolos para injeção de dependência
export const PROVEDOR_TABELAS = Symbol('PROVEDOR_TABELAS');
export const PROVEDOR_RELACOES = Symbol('PROVEDOR_RELACOES');
export const PROVEDOR_QUERY = Symbol('PROVEDOR_QUERY');
