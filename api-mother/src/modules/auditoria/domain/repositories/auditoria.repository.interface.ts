/**
 * Interface: IAuditoriaRepository
 *
 * Define o contrato para operacoes de persistencia de auditoria.
 */

import { RegistroAuditoria, TipoOperacao } from '../entities';

export interface FiltrosHistorico {
  codUsuario?: number;
  tabela?: string;
  operacao?: TipoOperacao;
  dataInicio?: Date;
  dataFim?: Date;
  sucesso?: 'S' | 'N';
  chaveRegistro?: string;
  limite?: number;
  offset?: number;
}

export interface ResultadoPaginado<T> {
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface IAuditoriaRepository {
  /**
   * Insere um novo registro de auditoria
   */
  inserir(registro: RegistroAuditoria): Promise<number>;

  /**
   * Busca registros de auditoria por filtros
   */
  buscarPorFiltros(filtros: FiltrosHistorico): Promise<ResultadoPaginado<RegistroAuditoria>>;

  /**
   * Busca um registro de auditoria por ID
   */
  buscarPorId(auditoriaId: number): Promise<RegistroAuditoria | null>;

  /**
   * Busca registros por tabela e chave
   */
  buscarPorTabelaEChave(tabela: string, chaveRegistro: string): Promise<RegistroAuditoria[]>;

  /**
   * Conta total de registros por filtros
   */
  contarPorFiltros(filtros: FiltrosHistorico): Promise<number>;

  /**
   * Busca ultimos N registros de uma tabela
   */
  buscarUltimosRegistros(tabela: string, limite: number): Promise<RegistroAuditoria[]>;

  /**
   * Busca estatisticas de auditoria
   */
  buscarEstatisticas(filtros: FiltrosHistorico): Promise<{
    totalRegistros: number;
    totalInserts: number;
    totalUpdates: number;
    totalDeletes: number;
    totalSelects: number;
    totalSucessos: number;
    totalFalhas: number;
  }>;
}

export const REPOSITORIO_AUDITORIA = Symbol('IAuditoriaRepository');
