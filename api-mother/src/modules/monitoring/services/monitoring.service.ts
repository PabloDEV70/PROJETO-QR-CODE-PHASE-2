import { Injectable } from '@nestjs/common';
import { MonitoringSqlServerService } from '../../../database/monitoring-sqlserver.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { QueryStatDto } from '../dto/query-stat.dto';
import { ActiveQueryDto } from '../dto/active-query.dto';
import { WaitStatDto } from '../dto/wait-stat.dto';
import { SessionStatDto } from '../dto/session-stat.dto';
import { UserQueryRankingDto } from '../dto/user-query-ranking.dto';
import { HeavyQueryDto } from '../dto/heavy-query.dto';

/**
 * Service for SQL Server performance monitoring using DMVs.
 * Uses dedicated monitoring connection with elevated permissions (sa user).
 * All operations are READ-ONLY.
 */
@Injectable()
export class MonitoringService {
  constructor(
    private readonly monitoringDb: MonitoringSqlServerService,
    private readonly logger: StructuredLogger,
  ) {}

  /**
   * Check if monitoring connection is available
   */
  async checkPermissions(): Promise<{ hasViewServerState: boolean; hasViewDatabaseState: boolean }> {
    const startTime = Date.now();
    this.logger.info('Checking monitoring connection');

    try {
      const pingResult = await this.monitoringDb.ping();
      const duration = Date.now() - startTime;

      if (pingResult.connected) {
        // Verify we can actually access DMVs
        const testQuery = `SELECT TOP 1 1 AS test FROM sys.dm_exec_sessions`;
        await this.monitoringDb.executeReadOnlyQuery(testQuery, []);

        this.logger.info(`Monitoring connection verified in ${duration}ms`);
        return { hasViewServerState: true, hasViewDatabaseState: true };
      } else {
        this.logger.error('Monitoring connection failed', new Error(pingResult.error || 'Connection failed'));
        return { hasViewServerState: false, hasViewDatabaseState: false };
      }
    } catch (error) {
      this.logger.error('Failed to verify monitoring permissions', error as Error);
      return { hasViewServerState: false, hasViewDatabaseState: false };
    }
  }

  /**
   * Get query execution statistics from sys.dm_exec_query_stats
   * Includes user, host, program information and identifies Sankhya vs external queries
   * @param limit Maximum number of queries to return (default 50)
   * @returns Array of query statistics with full context
   */
  async getQueryStats(limit = 50): Promise<QueryStatDto[]> {
    const startTime = Date.now();
    this.logger.info(`Fetching top ${limit} query statistics from DMVs with full context`);

    const query = `
      SELECT TOP ${limit}
        qs.execution_count,
        qs.total_worker_time / 1000 AS total_cpu_ms,
        CASE
          WHEN qs.execution_count > 0
          THEN (qs.total_worker_time / qs.execution_count) / 1000
          ELSE 0
        END AS avg_cpu_ms,
        qs.total_elapsed_time / 1000 AS total_duration_ms,
        CASE
          WHEN qs.execution_count > 0
          THEN (qs.total_elapsed_time / qs.execution_count) / 1000
          ELSE 0
        END AS avg_duration_ms,
        qs.total_logical_reads,
        qs.total_logical_writes,
        qs.total_physical_reads,
        qs.last_execution_time,
        qs.creation_time,
        qs.plan_generation_num,
        CONVERT(varchar(64), qs.plan_handle, 1) AS plan_handle,
        CONVERT(varchar(64), qs.sql_handle, 1) AS sql_handle,
        SUBSTRING(
          st.text,
          (qs.statement_start_offset/2)+1,
          ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(st.text)
            ELSE qs.statement_end_offset
          END - qs.statement_start_offset)/2) + 1
        ) AS query_text,
        -- Database info
        DB_NAME(st.dbid) AS database_name,
        st.dbid AS database_id,
        OBJECT_NAME(st.objectid, st.dbid) AS object_name,
        -- Get last session info if query is currently running
        (SELECT TOP 1 s.login_name
         FROM sys.dm_exec_sessions s
         INNER JOIN sys.dm_exec_requests r ON s.session_id = r.session_id
         WHERE r.plan_handle = qs.plan_handle) AS last_login_name,
        (SELECT TOP 1 s.host_name
         FROM sys.dm_exec_sessions s
         INNER JOIN sys.dm_exec_requests r ON s.session_id = r.session_id
         WHERE r.plan_handle = qs.plan_handle) AS last_host_name,
        (SELECT TOP 1 s.program_name
         FROM sys.dm_exec_sessions s
         INNER JOIN sys.dm_exec_requests r ON s.session_id = r.session_id
         WHERE r.plan_handle = qs.plan_handle) AS last_program_name,
        (SELECT TOP 1 c.client_net_address
         FROM sys.dm_exec_connections c
         INNER JOIN sys.dm_exec_requests r ON c.session_id = r.session_id
         WHERE r.plan_handle = qs.plan_handle) AS last_client_ip,
        -- Identify if query is from Sankhya (based on table names)
        CASE
          WHEN st.text LIKE '%SANKHYA%' OR st.text LIKE '%TGFPRO%' OR st.text LIKE '%TGFCAB%'
               OR st.text LIKE '%TSIUSU%' OR st.text LIKE '%TFPFUN%' OR st.text LIKE '%TGFPAR%'
               OR st.text LIKE '%AD_TGFPRO%' OR st.text LIKE '%TSIEMP%'
               OR st.text LIKE '%TGF%' OR st.text LIKE '%TSI%' OR st.text LIKE '%TFP%'
          THEN 'SANKHYA'
          WHEN st.objectid IS NOT NULL
          THEN 'SYSTEM'
          ELSE 'EXTERNAL'
        END AS query_source,
        -- Calculate a cost score for ranking
        (qs.total_worker_time / 1000.0) +
        (qs.total_logical_reads / 100.0) +
        (qs.total_elapsed_time / 10000.0) AS cost_score
      FROM sys.dm_exec_query_stats qs
      CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
      WHERE st.text NOT LIKE '%sys.dm_exec%'
        AND st.text NOT LIKE '%FETCH API_CURSOR%'
      ORDER BY qs.total_worker_time DESC
    `;

    try {
      const result = await this.monitoringDb.executeReadOnlyQuery(query, []);
      const duration = Date.now() - startTime;

      this.logger.info(`Retrieved ${result.length} query stats in ${duration}ms`);

      return result as QueryStatDto[];
    } catch (error) {
      this.logger.error('Failed to fetch query statistics', error as Error);
      throw error;
    }
  }

  /**
   * Get currently executing queries from sys.dm_exec_requests
   * @returns Array of active queries
   */
  async getActiveQueries(): Promise<ActiveQueryDto[]> {
    const startTime = Date.now();
    this.logger.info('Fetching active queries from DMVs');

    const query = `
      SELECT
        r.session_id,
        r.status,
        r.command,
        r.cpu_time,
        r.total_elapsed_time,
        r.wait_type,
        r.wait_time,
        r.blocking_session_id,
        r.open_transaction_count,
        r.database_id,
        DB_NAME(r.database_id) AS database_name,
        SUBSTRING(
          st.text,
          (r.statement_start_offset/2)+1,
          ((CASE r.statement_end_offset
            WHEN -1 THEN DATALENGTH(st.text)
            ELSE r.statement_end_offset
          END - r.statement_start_offset)/2) + 1
        ) AS query_text
      FROM sys.dm_exec_requests r
      CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) st
      WHERE r.session_id != @@SPID
        AND r.session_id > 50
      ORDER BY r.total_elapsed_time DESC
    `;

    try {
      const result = await this.monitoringDb.executeReadOnlyQuery(query, []);
      const duration = Date.now() - startTime;

      this.logger.info(`Retrieved ${result.length} active queries in ${duration}ms`);

      return result as ActiveQueryDto[];
    } catch (error) {
      this.logger.error('Failed to fetch active queries', error as Error);
      throw error;
    }
  }

  /**
   * Get wait statistics from sys.dm_os_wait_stats
   * @param limit Maximum number of wait types to return (default 20)
   * @returns Array of wait statistics
   */
  async getWaitStats(limit = 20): Promise<WaitStatDto[]> {
    const startTime = Date.now();
    this.logger.info(`Fetching top ${limit} wait statistics from DMVs`);

    const query = `
      SELECT TOP ${limit}
        wait_type,
        waiting_tasks_count,
        wait_time_ms,
        max_wait_time_ms,
        signal_wait_time_ms,
        wait_time_ms - signal_wait_time_ms AS resource_wait_time_ms,
        CASE
          WHEN waiting_tasks_count > 0
          THEN wait_time_ms / waiting_tasks_count
          ELSE 0
        END AS avg_wait_time_ms
      FROM sys.dm_os_wait_stats
      WHERE wait_type NOT LIKE '%SLEEP%'
        AND wait_type NOT LIKE 'CLR%'
        AND wait_type NOT LIKE 'SQLTRACE%'
        AND wait_type NOT LIKE 'BROKER%'
        AND wait_type NOT LIKE 'XE%'
        AND wait_type NOT LIKE 'LAZYWRITER%'
        AND wait_type NOT LIKE 'CHECKPOINT%'
        AND wait_type NOT IN ('WAITFOR', 'REQUEST_FOR_DEADLOCK_SEARCH', 'DIRTY_PAGE_POLL')
        AND wait_time_ms > 0
      ORDER BY wait_time_ms DESC
    `;

    try {
      const result = await this.monitoringDb.executeReadOnlyQuery(query, []);
      const duration = Date.now() - startTime;

      this.logger.info(`Retrieved ${result.length} wait stats in ${duration}ms`);

      return result as WaitStatDto[];
    } catch (error) {
      this.logger.error('Failed to fetch wait statistics', error as Error);
      throw error;
    }
  }

  /**
   * Get active session information from sys.dm_exec_sessions
   * @returns Array of session information
   */
  async getSessionStats(): Promise<SessionStatDto[]> {
    const startTime = Date.now();
    this.logger.info('Fetching active session statistics from DMVs');

    const query = `
      SELECT
        s.session_id,
        s.login_time,
        s.host_name,
        s.program_name,
        s.login_name,
        s.status,
        s.cpu_time,
        s.memory_usage,
        s.total_scheduled_time,
        s.total_elapsed_time,
        s.last_request_start_time,
        s.last_request_end_time,
        s.reads,
        s.writes,
        s.logical_reads,
        DB_NAME(s.database_id) AS database_name,
        c.client_net_address,
        c.num_reads AS connection_reads,
        c.num_writes AS connection_writes
      FROM sys.dm_exec_sessions s
      LEFT JOIN sys.dm_exec_connections c ON s.session_id = c.session_id
      WHERE s.session_id > 50
        AND s.is_user_process = 1
      ORDER BY s.last_request_start_time DESC
    `;

    try {
      const result = await this.monitoringDb.executeReadOnlyQuery(query, []);
      const duration = Date.now() - startTime;

      this.logger.info(`Retrieved ${result.length} sessions in ${duration}ms`);

      return result as SessionStatDto[];
    } catch (error) {
      this.logger.error('Failed to fetch session statistics', error as Error);
      throw error;
    }
  }

  /**
   * Get ranking of users with heaviest queries
   * Aggregates query costs per login and shows top consumers
   * @param limit Maximum number of users to return (default 20)
   * @returns Array of users ranked by query cost
   */
  async getUserQueryRanking(limit = 20): Promise<UserQueryRankingDto[]> {
    const startTime = Date.now();
    this.logger.info(`Fetching top ${limit} users by query cost`);

    const query = `
      WITH UserQueries AS (
        SELECT
          s.login_name,
          s.host_name,
          s.program_name,
          c.client_net_address,
          r.cpu_time,
          r.total_elapsed_time,
          r.logical_reads,
          r.writes,
          -- Identify if Sankhya or external (comprehensive patterns)
          CASE
            -- Sankhya System patterns
            WHEN s.program_name LIKE '%Sankhya%' OR s.program_name LIKE '%SPED%'
                 OR s.program_name LIKE '%MGE%' OR s.program_name LIKE '%sankhyaw%'
                 OR s.program_name LIKE '%SnkCore%' OR s.program_name LIKE '%SNK%'
                 OR s.program_name LIKE '%jiva%' OR s.program_name LIKE '%JIVA%'
                 OR s.program_name LIKE '%mgeweb%' OR s.program_name LIKE '%mge.%'
                 OR s.program_name LIKE '%sankhya.%' OR s.program_name LIKE '%snk.%'
            THEN 'SANKHYA'
            -- Developer/DBA Tools patterns
            WHEN s.program_name LIKE '%SQL Server Management Studio%'
                 OR s.program_name LIKE '%SSMS%' OR s.program_name LIKE '%sqlcmd%'
                 OR s.program_name LIKE '%DBeaver%' OR s.program_name LIKE '%Azure Data Studio%'
                 OR s.program_name LIKE '%azdata%' OR s.program_name LIKE '%vscode%'
                 OR s.program_name LIKE '%DataGrip%' OR s.program_name LIKE '%HeidiSQL%'
                 OR s.program_name LIKE '%Navicat%' OR s.program_name LIKE '%TablePlus%'
                 OR s.program_name LIKE '%Beekeeper%' OR s.program_name LIKE '%mssql-cli%'
                 OR s.program_name LIKE '%SQLyog%' OR s.program_name LIKE '%Toad%'
                 OR s.program_name LIKE '%DbVisualizer%' OR s.program_name LIKE '%Aqua Data Studio%'
                 OR s.program_name LIKE '%RazorSQL%' OR s.program_name LIKE '%DBngin%'
            THEN 'DBA_TOOL'
            -- Application patterns
            WHEN s.program_name LIKE '%.Net%' OR s.program_name LIKE '%Node%'
                 OR s.program_name LIKE '%Java%' OR s.program_name LIKE '%Python%'
                 OR s.program_name LIKE '%tedious%' OR s.program_name LIKE '%mssql%'
                 OR s.program_name LIKE '%JDBC%' OR s.program_name LIKE '%ODBC%'
            THEN 'APPLICATION'
            ELSE 'EXTERNAL'
          END AS source_type
        FROM sys.dm_exec_sessions s
        LEFT JOIN sys.dm_exec_connections c ON s.session_id = c.session_id
        LEFT JOIN sys.dm_exec_requests r ON s.session_id = r.session_id
        WHERE s.is_user_process = 1
          AND s.session_id > 50
      )
      SELECT TOP ${limit}
        login_name,
        MAX(host_name) AS host_name,
        MAX(program_name) AS program_name,
        MAX(client_net_address) AS client_ip,
        MAX(source_type) AS source_type,
        COUNT(*) AS session_count,
        SUM(ISNULL(cpu_time, 0)) AS total_cpu_time,
        SUM(ISNULL(total_elapsed_time, 0)) AS total_elapsed_time,
        SUM(ISNULL(logical_reads, 0)) AS total_logical_reads,
        SUM(ISNULL(writes, 0)) AS total_writes,
        AVG(ISNULL(cpu_time, 0)) AS avg_cpu_time,
        AVG(ISNULL(logical_reads, 0)) AS avg_logical_reads,
        -- Cost score calculation
        (SUM(ISNULL(cpu_time, 0)) / 1000.0) +
        (SUM(ISNULL(logical_reads, 0)) / 100.0) +
        (SUM(ISNULL(total_elapsed_time, 0)) / 10000.0) AS cost_score
      FROM UserQueries
      GROUP BY login_name
      ORDER BY cost_score DESC
    `;

    try {
      const result = await this.monitoringDb.executeReadOnlyQuery(query, []);
      const duration = Date.now() - startTime;

      this.logger.info(`Retrieved ${result.length} user rankings in ${duration}ms`);

      return result as UserQueryRankingDto[];
    } catch (error) {
      this.logger.error('Failed to fetch user query ranking', error as Error);
      throw error;
    }
  }

  /**
   * Get heavy queries with detailed information
   * Identifies queries with high CPU, reads, or duration
   * @param limit Maximum number of queries to return (default 50)
   * @param minCpuMs Minimum CPU time in ms (default 1000)
   * @returns Array of heavy queries with full context
   */
  async getHeavyQueries(limit = 50, minCpuMs = 1000): Promise<HeavyQueryDto[]> {
    const startTime = Date.now();
    this.logger.info(`Fetching top ${limit} heavy queries (min CPU: ${minCpuMs}ms)`);

    const query = `
      SELECT TOP ${limit}
        qs.execution_count,
        qs.total_worker_time / 1000 AS total_cpu_ms,
        CASE
          WHEN qs.execution_count > 0
          THEN (qs.total_worker_time / qs.execution_count) / 1000
          ELSE 0
        END AS avg_cpu_ms,
        qs.total_elapsed_time / 1000 AS total_duration_ms,
        CASE
          WHEN qs.execution_count > 0
          THEN (qs.total_elapsed_time / qs.execution_count) / 1000
          ELSE 0
        END AS avg_duration_ms,
        qs.total_logical_reads,
        qs.total_logical_writes,
        qs.total_physical_reads,
        qs.last_execution_time,
        qs.creation_time,
        CONVERT(varchar(64), qs.plan_handle, 1) AS plan_handle,
        CONVERT(varchar(64), qs.sql_handle, 1) AS sql_handle,
        SUBSTRING(
          st.text,
          (qs.statement_start_offset/2)+1,
          ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(st.text)
            ELSE qs.statement_end_offset
          END - qs.statement_start_offset)/2) + 1
        ) AS query_text,
        st.text AS full_text,
        DB_NAME(st.dbid) AS database_name,
        OBJECT_NAME(st.objectid, st.dbid) AS object_name,
        -- Identify query source
        CASE
          WHEN st.text LIKE '%SANKHYA%' OR st.text LIKE '%TGF%' OR st.text LIKE '%TSI%'
               OR st.text LIKE '%TFP%' OR st.text LIKE '%AD[_]%'
          THEN 'SANKHYA'
          WHEN st.objectid IS NOT NULL
          THEN 'SYSTEM'
          ELSE 'EXTERNAL'
        END AS query_source,
        -- Severity classification
        CASE
          WHEN (qs.total_worker_time / 1000) > 60000 OR qs.total_logical_reads > 1000000
          THEN 'CRITICAL'
          WHEN (qs.total_worker_time / 1000) > 10000 OR qs.total_logical_reads > 100000
          THEN 'HIGH'
          WHEN (qs.total_worker_time / 1000) > 5000 OR qs.total_logical_reads > 50000
          THEN 'MEDIUM'
          ELSE 'LOW'
        END AS severity,
        -- Cost score
        (qs.total_worker_time / 1000.0) +
        (qs.total_logical_reads / 100.0) +
        (qs.total_elapsed_time / 10000.0) AS cost_score
      FROM sys.dm_exec_query_stats qs
      CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
      WHERE st.text NOT LIKE '%sys.dm_exec%'
        AND st.text NOT LIKE '%FETCH API_CURSOR%'
        AND (qs.total_worker_time / 1000) >= ${minCpuMs}
      ORDER BY
        CASE
          WHEN (qs.total_worker_time / 1000) > 60000 OR qs.total_logical_reads > 1000000 THEN 1
          WHEN (qs.total_worker_time / 1000) > 10000 OR qs.total_logical_reads > 100000 THEN 2
          WHEN (qs.total_worker_time / 1000) > 5000 OR qs.total_logical_reads > 50000 THEN 3
          ELSE 4
        END,
        qs.total_worker_time DESC
    `;

    try {
      const result = await this.monitoringDb.executeReadOnlyQuery(query, []);
      const duration = Date.now() - startTime;

      this.logger.info(`Retrieved ${result.length} heavy queries in ${duration}ms`);

      return result as HeavyQueryDto[];
    } catch (error) {
      this.logger.error('Failed to fetch heavy queries', error as Error);
      throw error;
    }
  }

  /**
   * Get currently active sessions with their running queries
   * Shows real-time info about who is connected and what they're doing
   * @returns Array of active sessions with query details
   */
  async getActiveSessionsDetail(): Promise<any[]> {
    const startTime = Date.now();
    this.logger.info('Fetching detailed active sessions');

    const query = `
      SELECT
        s.session_id,
        s.login_name,
        s.host_name,
        s.program_name,
        s.status AS session_status,
        s.login_time,
        s.last_request_start_time,
        s.last_request_end_time,
        s.cpu_time AS session_cpu_time,
        s.memory_usage * 8 AS memory_usage_kb,
        s.reads AS session_reads,
        s.writes AS session_writes,
        s.logical_reads AS session_logical_reads,
        DB_NAME(s.database_id) AS current_database,
        c.client_net_address,
        c.client_tcp_port,
        c.local_net_address AS server_ip,
        c.local_tcp_port AS server_port,
        c.connect_time,
        c.net_transport,
        c.protocol_type,
        c.auth_scheme,
        c.encrypt_option,
        -- Current request info (if any)
        r.request_id,
        r.status AS request_status,
        r.command,
        r.sql_handle,
        r.plan_handle,
        r.wait_type,
        r.wait_time,
        r.wait_resource,
        r.blocking_session_id,
        r.cpu_time AS request_cpu_time,
        r.total_elapsed_time AS request_elapsed_time,
        r.reads AS request_reads,
        r.writes AS request_writes,
        r.logical_reads AS request_logical_reads,
        r.percent_complete,
        -- Query text for active request
        SUBSTRING(
          st.text,
          (r.statement_start_offset/2)+1,
          ((CASE r.statement_end_offset
            WHEN -1 THEN DATALENGTH(st.text)
            ELSE r.statement_end_offset
          END - r.statement_start_offset)/2) + 1
        ) AS current_query,
        -- Identify source (comprehensive patterns)
        CASE
          -- Sankhya System patterns
          WHEN s.program_name LIKE '%Sankhya%' OR s.program_name LIKE '%MGE%'
               OR s.program_name LIKE '%sankhyaw%' OR s.program_name LIKE '%SPED%'
               OR s.program_name LIKE '%SnkCore%' OR s.program_name LIKE '%SNK%'
               OR s.program_name LIKE '%jiva%' OR s.program_name LIKE '%JIVA%'
               OR s.program_name LIKE '%mgeweb%' OR s.program_name LIKE '%mge.%'
               OR s.program_name LIKE '%sankhya.%' OR s.program_name LIKE '%snk.%'
          THEN 'SANKHYA'
          -- Developer/DBA Tools patterns
          WHEN s.program_name LIKE '%SQL Server Management Studio%'
               OR s.program_name LIKE '%SSMS%' OR s.program_name LIKE '%DBeaver%'
               OR s.program_name LIKE '%Azure Data Studio%' OR s.program_name LIKE '%azdata%'
               OR s.program_name LIKE '%vscode%' OR s.program_name LIKE '%DataGrip%'
               OR s.program_name LIKE '%HeidiSQL%' OR s.program_name LIKE '%Navicat%'
               OR s.program_name LIKE '%TablePlus%' OR s.program_name LIKE '%Beekeeper%'
               OR s.program_name LIKE '%sqlcmd%' OR s.program_name LIKE '%mssql-cli%'
          THEN 'DBA_TOOL'
          -- Application patterns
          WHEN s.program_name LIKE '%.Net%' OR s.program_name LIKE '%Node%'
               OR s.program_name LIKE '%Java%' OR s.program_name LIKE '%Python%'
               OR s.program_name LIKE '%tedious%' OR s.program_name LIKE '%JDBC%'
          THEN 'APPLICATION'
          ELSE 'EXTERNAL'
        END AS source_type
      FROM sys.dm_exec_sessions s
      LEFT JOIN sys.dm_exec_connections c ON s.session_id = c.session_id
      LEFT JOIN sys.dm_exec_requests r ON s.session_id = r.session_id
      OUTER APPLY sys.dm_exec_sql_text(r.sql_handle) st
      WHERE s.is_user_process = 1
        AND s.session_id > 50
        AND s.session_id != @@SPID
      ORDER BY s.last_request_start_time DESC
    `;

    try {
      const result = await this.monitoringDb.executeReadOnlyQuery(query, []);
      const duration = Date.now() - startTime;

      this.logger.info(`Retrieved ${result.length} active sessions detail in ${duration}ms`);

      return result;
    } catch (error) {
      this.logger.error('Failed to fetch active sessions detail', error as Error);
      throw error;
    }
  }

  /**
   * Get database server overview statistics
   * @returns Server overview information
   */
  async getServerOverview(): Promise<any> {
    const startTime = Date.now();
    this.logger.info('Fetching server overview statistics');

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

    try {
      const result = await this.monitoringDb.executeReadOnlyQuery(query, []);
      const duration = Date.now() - startTime;

      this.logger.info(`Retrieved server overview in ${duration}ms`);

      return result[0] || {};
    } catch (error) {
      this.logger.error('Failed to fetch server overview', error as Error);
      throw error;
    }
  }
}
