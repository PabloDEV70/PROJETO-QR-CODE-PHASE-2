/**
 * Ports: Provedores de Database Explorer
 *
 * Interfaces para os provedores de exploração do banco de dados.
 */
import {
  ResumoDatabase,
  View,
  ViewDetalhe,
  Trigger,
  TriggerDetalhe,
  Procedure,
  ProcedureDetalhe,
  Relacionamento,
  EstatisticasCache,
} from '../../domain/entities';

/**
 * Opções de paginação e filtro
 */
export interface OpcoesPaginacao {
  schema?: string;
  limite?: number;
  offset?: number;
  truncar?: boolean;
  incluirDefinicao?: boolean;
}

/**
 * Interface para consulta de resumo do banco
 */
export interface IProvedorResumoDatabase {
  /**
   * Obtém resumo estatístico do banco de dados
   */
  obterResumo(): Promise<ResumoDatabase>;
}

/**
 * Interface para consulta de views
 */
export interface IProvedorViews {
  /**
   * Lista views do banco de dados
   */
  listarViews(opcoes: OpcoesPaginacao): Promise<View[]>;

  /**
   * Obtém detalhes de uma view específica
   */
  obterDetalheView(schema: string, nome: string, truncar?: boolean): Promise<ViewDetalhe>;
}

/**
 * Interface para consulta de triggers
 */
export interface IProvedorTriggers {
  /**
   * Lista triggers do banco de dados
   */
  listarTriggers(opcoes: OpcoesPaginacao): Promise<Trigger[]>;

  /**
   * Obtém detalhes de um trigger específico
   */
  obterDetalheTrigger(schema: string, nome: string, truncar?: boolean): Promise<TriggerDetalhe>;
}

/**
 * Interface para consulta de procedures
 */
export interface IProvedorProcedures {
  /**
   * Lista procedures do banco de dados
   */
  listarProcedures(opcoes: OpcoesPaginacao): Promise<Procedure[]>;

  /**
   * Obtém detalhes de uma procedure específica
   */
  obterDetalheProcedure(schema: string, nome: string, truncar?: boolean): Promise<ProcedureDetalhe>;
}

/**
 * Interface para consulta de relacionamentos
 */
export interface IProvedorRelacionamentos {
  /**
   * Lista relacionamentos de chave estrangeira
   */
  listarRelacionamentos(opcoes: OpcoesPaginacao): Promise<Relacionamento[]>;
}

/**
 * Interface para gerenciamento de cache
 */
export interface IProvedorCache {
  /**
   * Limpa o cache
   */
  limparCache(): Promise<void>;

  /**
   * Obtém estatísticas do cache
   */
  obterEstatisticasCache(): Promise<EstatisticasCache>;
}

// Símbolos para injeção de dependência
export const PROVEDOR_RESUMO_DATABASE = Symbol('PROVEDOR_RESUMO_DATABASE');
export const PROVEDOR_VIEWS = Symbol('PROVEDOR_VIEWS');
export const PROVEDOR_TRIGGERS = Symbol('PROVEDOR_TRIGGERS');
export const PROVEDOR_PROCEDURES = Symbol('PROVEDOR_PROCEDURES');
export const PROVEDOR_RELACIONAMENTOS = Symbol('PROVEDOR_RELACIONAMENTOS');
export const PROVEDOR_CACHE = Symbol('PROVEDOR_CACHE');
