/**
 * Ports: Provedores de Monitoramento
 *
 * Interfaces para os provedores de monitoramento do módulo Monitoring V2.
 */
import { EstatisticasQuery, QueryAtiva, EstatisticaEspera, SessaoAtiva, VisaoServidor } from '../../domain/entities';

/**
 * Resultado da verificação de permissões
 */
export interface PermissoesMonitoramento {
  hasViewServerState: boolean;
  hasViewDatabaseState: boolean;
}

/**
 * Interface para consulta de estatísticas de queries
 */
export interface IProvedorEstatisticasQuery {
  /**
   * Obtém estatísticas de execução de queries
   */
  obterEstatisticas(limite: number): Promise<EstatisticasQuery[]>;

  /**
   * Obtém queries pesadas com severidade
   */
  obterQueriesPesadas(limite: number, cpuMinimoMs: number): Promise<EstatisticasQuery[]>;
}

/**
 * Interface para consulta de queries ativas
 */
export interface IProvedorQueriesAtivas {
  /**
   * Obtém queries em execução no momento
   */
  obterQueriesAtivas(): Promise<QueryAtiva[]>;
}

/**
 * Interface para consulta de estatísticas de espera
 */
export interface IProvedorEstatisticasEspera {
  /**
   * Obtém estatísticas de espera do servidor
   */
  obterEstatisticasEspera(limite: number): Promise<EstatisticaEspera[]>;
}

/**
 * Interface para consulta de sessões
 */
export interface IProvedorSessoes {
  /**
   * Obtém sessões ativas no servidor
   */
  obterSessoesAtivas(): Promise<SessaoAtiva[]>;

  /**
   * Obtém detalhes completos das sessões
   */
  obterDetalhesSessoes(): Promise<SessaoAtiva[]>;
}

/**
 * Interface para visão geral do servidor
 */
export interface IProvedorVisaoServidor {
  /**
   * Verifica permissões de monitoramento
   */
  verificarPermissoes(): Promise<PermissoesMonitoramento>;

  /**
   * Obtém visão geral do servidor
   */
  obterVisaoGeral(): Promise<VisaoServidor>;
}

// Símbolos para injeção de dependência
export const PROVEDOR_ESTATISTICAS_QUERY = Symbol('PROVEDOR_ESTATISTICAS_QUERY');
export const PROVEDOR_QUERIES_ATIVAS = Symbol('PROVEDOR_QUERIES_ATIVAS');
export const PROVEDOR_ESTATISTICAS_ESPERA = Symbol('PROVEDOR_ESTATISTICAS_ESPERA');
export const PROVEDOR_SESSOES = Symbol('PROVEDOR_SESSOES');
export const PROVEDOR_VISAO_SERVIDOR = Symbol('PROVEDOR_VISAO_SERVIDOR');
