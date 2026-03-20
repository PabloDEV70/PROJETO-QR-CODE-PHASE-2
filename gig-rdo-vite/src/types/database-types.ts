// ── Query ──────────────────────────────────────────────
export interface DbQueryResult {
  linhas: Record<string, unknown>[];
  quantidadeLinhas: number;
  tempoExecucaoMs: number;
}

// ── Monitor ────────────────────────────────────────────
export interface QueryAtiva {
  session_id: number;
  status: string;
  start_time: string;
  cpu_time: number;
  total_elapsed_time: number;
  reads: number;
  writes: number;
  logical_reads: number;
  text: string;
  database_name: string;
  login_name: string;
  host_name: string;
  program_name: string;
  wait_type: string | null;
  wait_time: number;
  blocking_session_id: number | null;
  percent_complete: number;
}

export interface EstatisticasQuery {
  query_hash: string;
  execution_count: number;
  total_worker_time: number;
  total_elapsed_time: number;
  total_logical_reads: number;
  total_logical_writes: number;
  total_rows: number;
  avg_worker_time: number;
  avg_elapsed_time: number;
  avg_logical_reads: number;
  avg_rows: number;
  query_text: string;
  creation_time: string;
  last_execution_time: string;
}

export interface SessaoAtiva {
  session_id: number;
  login_name: string;
  host_name: string;
  program_name: string;
  status: string;
  database_name: string;
  cpu_time: number;
  memory_usage: number;
  reads: number;
  writes: number;
  logical_reads: number;
  login_time: string;
  last_request_start_time: string;
}

export interface VisaoServidor {
  nome: string;
  versao: string;
  edicao: string;
  nivelCompatibilidade: number;
  collation: string;
  memoriaTotal: number;
  memoriaDisponivel: number;
  cpuCount: number;
  uptimeDias: number;
  conexoesAtivas: number;
}

export interface EstatisticaEspera {
  wait_type: string;
  waiting_tasks_count: number;
  wait_time_ms: number;
  max_wait_time_ms: number;
  signal_wait_time_ms: number;
}

// ── Tables ─────────────────────────────────────────────
export interface TabelaInfo {
  TABLE_NAME: string;
  TABLE_TYPE: string;
}

export interface ColunaSchema {
  COLUMN_NAME: string;
  DATA_TYPE: string;
  IS_NULLABLE: string;
  ORDINAL_POSITION: number;
  COLUMN_DEFAULT: string | null;
}

export type {
  DbView, DbViewDetalhe, DbProcedure, DbProcedureDetalhe,
  DbTrigger, DbTriggerDetalhe, DbRelacionamento, DbListOptions,
  EstatisticasCache, TabelaDicionario, CampoDicionario, TableTrigger,
  FieldOption, TableInstance, FieldTypesMap, DictFieldSearchResult,
  RegistroAuditoria, EstatisticasAuditoria, ListaAuditoria, AuditoriaFilters,
} from './database-objects-types';
