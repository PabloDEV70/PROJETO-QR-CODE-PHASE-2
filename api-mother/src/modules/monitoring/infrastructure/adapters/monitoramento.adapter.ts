/**
 * Adapter: MonitoramentoAdapter
 *
 * Implementação dos provedores de monitoramento usando MonitoringSqlServerService.
 */
import { Injectable } from '@nestjs/common';
import { MonitoringSqlServerService } from '../../../../database/monitoring-sqlserver.service';
import {
  IProvedorEstatisticasQuery,
  IProvedorQueriesAtivas,
  IProvedorEstatisticasEspera,
  IProvedorSessoes,
  IProvedorVisaoServidor,
  PermissoesMonitoramento,
} from '../../application/ports';
import { EstatisticasQuery, QueryAtiva, EstatisticaEspera, SessaoAtiva, VisaoServidor } from '../../domain/entities';

@Injectable()
export class MonitoramentoAdapter
  implements
    IProvedorEstatisticasQuery,
    IProvedorQueriesAtivas,
    IProvedorEstatisticasEspera,
    IProvedorSessoes,
    IProvedorVisaoServidor
{
  constructor(private readonly monitoringDb: MonitoringSqlServerService) {}

  async verificarPermissoes(): Promise<PermissoesMonitoramento> {
    try {
      const pingResult = await this.monitoringDb.ping();

      if (pingResult.connected) {
        const testQuery = `SELECT TOP 1 1 AS test FROM sys.dm_exec_sessions`;
        await this.monitoringDb.executeReadOnlyQuery(testQuery, []);
        return { hasViewServerState: true, hasViewDatabaseState: true };
      }

      return { hasViewServerState: false, hasViewDatabaseState: false };
    } catch {
      return { hasViewServerState: false, hasViewDatabaseState: false };
    }
  }

  async obterVisaoGeral(): Promise<VisaoServidor> {
    const query = `
      SELECT
        @@VERSION AS sql_version,
        @@SERVERNAME AS server_name,
        DB_NAME() AS current_database,
        (SELECT COUNT(*) FROM sys.dm_exec_sessions WHERE is_user_process = 1) AS active_user_sessions,
        (SELECT COUNT(*) FROM sys.dm_exec_requests WHERE session_id > 50) AS active_requests,
        (SELECT cntr_value FROM sys.dm_os_performance_counters
         WHERE counter_name = 'User Connections') AS user_connections,
        GETDATE() AS server_time
    `;

    const result = await this.monitoringDb.executeReadOnlyQuery(query, []);
    return VisaoServidor.criar(result[0] || {});
  }

  async obterEstatisticas(limite: number): Promise<EstatisticasQuery[]> {
    const query = `
      SELECT TOP ${limite}
        qs.execution_count,
        qs.total_worker_time / 1000 AS total_cpu_ms,
        CASE WHEN qs.execution_count > 0
          THEN (qs.total_worker_time / qs.execution_count) / 1000
          ELSE 0 END AS avg_cpu_ms,
        qs.total_elapsed_time / 1000 AS total_duration_ms,
        CASE WHEN qs.execution_count > 0
          THEN (qs.total_elapsed_time / qs.execution_count) / 1000
          ELSE 0 END AS avg_duration_ms,
        qs.total_logical_reads,
        qs.total_logical_writes,
        qs.total_physical_reads,
        qs.last_execution_time,
        qs.creation_time,
        CONVERT(varchar(64), qs.plan_handle, 1) AS plan_handle,
        CONVERT(varchar(64), qs.sql_handle, 1) AS sql_handle,
        SUBSTRING(st.text, (qs.statement_start_offset/2)+1,
          ((CASE qs.statement_end_offset WHEN -1 THEN DATALENGTH(st.text)
            ELSE qs.statement_end_offset END - qs.statement_start_offset)/2) + 1) AS query_text,
        DB_NAME(st.dbid) AS database_name,
        OBJECT_NAME(st.objectid, st.dbid) AS object_name,
        CASE WHEN st.text LIKE '%TGF%' OR st.text LIKE '%TSI%' OR st.text LIKE '%TFP%'
          THEN 'SANKHYA' WHEN st.objectid IS NOT NULL THEN 'SYSTEM' ELSE 'EXTERNAL' END AS query_source,
        (qs.total_worker_time / 1000.0) + (qs.total_logical_reads / 100.0) +
        (qs.total_elapsed_time / 10000.0) AS cost_score
      FROM sys.dm_exec_query_stats qs
      CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
      WHERE st.text NOT LIKE '%sys.dm_exec%' AND st.text NOT LIKE '%FETCH API_CURSOR%'
      ORDER BY qs.total_worker_time DESC
    `;

    const result = await this.monitoringDb.executeReadOnlyQuery(query, []);
    return result.map((row: any) => EstatisticasQuery.criar(row));
  }

  async obterQueriesPesadas(limite: number, cpuMinimoMs: number): Promise<EstatisticasQuery[]> {
    const query = `
      SELECT TOP ${limite}
        qs.execution_count,
        qs.total_worker_time / 1000 AS total_cpu_ms,
        CASE WHEN qs.execution_count > 0
          THEN (qs.total_worker_time / qs.execution_count) / 1000
          ELSE 0 END AS avg_cpu_ms,
        qs.total_elapsed_time / 1000 AS total_duration_ms,
        CASE WHEN qs.execution_count > 0
          THEN (qs.total_elapsed_time / qs.execution_count) / 1000
          ELSE 0 END AS avg_duration_ms,
        qs.total_logical_reads,
        qs.total_logical_writes,
        qs.total_physical_reads,
        qs.last_execution_time,
        qs.creation_time,
        CONVERT(varchar(64), qs.plan_handle, 1) AS plan_handle,
        CONVERT(varchar(64), qs.sql_handle, 1) AS sql_handle,
        SUBSTRING(st.text, (qs.statement_start_offset/2)+1,
          ((CASE qs.statement_end_offset WHEN -1 THEN DATALENGTH(st.text)
            ELSE qs.statement_end_offset END - qs.statement_start_offset)/2) + 1) AS query_text,
        DB_NAME(st.dbid) AS database_name,
        OBJECT_NAME(st.objectid, st.dbid) AS object_name,
        CASE WHEN st.text LIKE '%TGF%' OR st.text LIKE '%TSI%' OR st.text LIKE '%TFP%'
          THEN 'SANKHYA' WHEN st.objectid IS NOT NULL THEN 'SYSTEM' ELSE 'EXTERNAL' END AS query_source,
        (qs.total_worker_time / 1000.0) + (qs.total_logical_reads / 100.0) +
        (qs.total_elapsed_time / 10000.0) AS cost_score
      FROM sys.dm_exec_query_stats qs
      CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
      WHERE st.text NOT LIKE '%sys.dm_exec%' AND st.text NOT LIKE '%FETCH API_CURSOR%'
        AND (qs.total_worker_time / 1000) >= ${cpuMinimoMs}
      ORDER BY qs.total_worker_time DESC
    `;

    const result = await this.monitoringDb.executeReadOnlyQuery(query, []);
    return result.map((row: any) => EstatisticasQuery.criar(row));
  }

  async obterQueriesAtivas(): Promise<QueryAtiva[]> {
    const query = `
      SELECT
        r.session_id, r.status, r.command, r.cpu_time, r.total_elapsed_time,
        r.wait_type, r.wait_time, r.blocking_session_id, r.open_transaction_count,
        r.database_id, DB_NAME(r.database_id) AS database_name,
        SUBSTRING(st.text, (r.statement_start_offset/2)+1,
          ((CASE r.statement_end_offset WHEN -1 THEN DATALENGTH(st.text)
            ELSE r.statement_end_offset END - r.statement_start_offset)/2) + 1) AS query_text
      FROM sys.dm_exec_requests r
      CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) st
      WHERE r.session_id != @@SPID AND r.session_id > 50
      ORDER BY r.total_elapsed_time DESC
    `;

    const result = await this.monitoringDb.executeReadOnlyQuery(query, []);
    return result.map((row: any) => QueryAtiva.criar(row));
  }

  async obterEstatisticasEspera(limite: number): Promise<EstatisticaEspera[]> {
    const query = `
      SELECT TOP ${limite}
        wait_type, waiting_tasks_count, wait_time_ms, max_wait_time_ms,
        signal_wait_time_ms, wait_time_ms - signal_wait_time_ms AS resource_wait_time_ms,
        CASE WHEN waiting_tasks_count > 0 THEN wait_time_ms / waiting_tasks_count ELSE 0 END AS avg_wait_time_ms
      FROM sys.dm_os_wait_stats
      WHERE wait_type NOT LIKE '%SLEEP%' AND wait_type NOT LIKE 'CLR%'
        AND wait_type NOT LIKE 'SQLTRACE%' AND wait_type NOT LIKE 'BROKER%'
        AND wait_type NOT LIKE 'XE%' AND wait_time_ms > 0
      ORDER BY wait_time_ms DESC
    `;

    const result = await this.monitoringDb.executeReadOnlyQuery(query, []);
    return result.map((row: any) => EstatisticaEspera.criar(row));
  }

  async obterSessoesAtivas(): Promise<SessaoAtiva[]> {
    const query = `
      SELECT
        s.session_id, s.login_time, s.host_name, s.program_name, s.login_name,
        s.status, s.cpu_time, s.memory_usage, s.total_scheduled_time, s.total_elapsed_time,
        s.last_request_start_time, s.last_request_end_time, s.reads, s.writes,
        s.logical_reads, DB_NAME(s.database_id) AS database_name, c.client_net_address
      FROM sys.dm_exec_sessions s
      LEFT JOIN sys.dm_exec_connections c ON s.session_id = c.session_id
      WHERE s.session_id > 50 AND s.is_user_process = 1
      ORDER BY s.last_request_start_time DESC
    `;

    const result = await this.monitoringDb.executeReadOnlyQuery(query, []);
    return result.map((row: any) => SessaoAtiva.criar(row));
  }

  async obterDetalhesSessoes(): Promise<SessaoAtiva[]> {
    return this.obterSessoesAtivas();
  }
}
