import { Injectable, OnModuleDestroy, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectionPool } from 'mssql';
import { StructuredLogger } from '../common/logging/structured-logger.service';

/**
 * Dedicated SQL Server service for monitoring operations.
 * Uses elevated credentials (sa) for VIEW SERVER STATE permission.
 *
 * SECURITY: This service ONLY allows SELECT queries.
 * Any attempt to execute INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, or EXEC will be rejected.
 */
@Injectable()
export class MonitoringSqlServerService implements OnModuleDestroy {
  private pool: ConnectionPool | null = null;
  private connecting: Promise<ConnectionPool> | null = null;

  // Patterns that are NOT allowed - anything that could modify data or structure
  private readonly FORBIDDEN_PATTERNS = [
    /\bINSERT\b/i,
    /\bUPDATE\b/i,
    /\bDELETE\b/i,
    /\bDROP\b/i,
    /\bALTER\b/i,
    /\bTRUNCATE\b/i,
    /\bCREATE\b/i,
    /\bEXEC\b/i,
    /\bEXECUTE\b/i,
    /\bSP_\b/i,
    /\bXP_\b/i,
    /\bGRANT\b/i,
    /\bREVOKE\b/i,
    /\bDENY\b/i,
    /\bOPENROWSET\b/i,
    /\bOPENQUERY\b/i,
    /\bBULK\s+INSERT\b/i,
    /\bSHUTDOWN\b/i,
    /\bRECONFIGURE\b/i,
  ];

  constructor(
    private configService: ConfigService,
    private logger: StructuredLogger,
  ) {}

  /**
   * Validates that a query is read-only (SELECT only)
   */
  private validateReadOnlyQuery(query: string): void {
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(query)) {
        this.logger.error('Forbidden query pattern detected in monitoring service', new Error('FORBIDDEN_QUERY'), {
          pattern: pattern.toString(),
          queryPreview: query.substring(0, 100),
        });
        throw new ForbiddenException({
          message: 'Operação não permitida no serviço de monitoramento',
          detail: 'O serviço de monitoramento aceita apenas consultas SELECT (read-only)',
          error: 'FORBIDDEN_QUERY_PATTERN',
        });
      }
    }

    // Additional check: query should start with SELECT or WITH (for CTEs)
    const trimmedQuery = query.trim();
    if (!trimmedQuery.match(/^(SELECT|WITH)\b/i)) {
      this.logger.error('Query does not start with SELECT or WITH', new Error('INVALID_QUERY_TYPE'), {
        queryPreview: query.substring(0, 100),
      });
      throw new ForbiddenException({
        message: 'Operação não permitida no serviço de monitoramento',
        detail: 'O serviço de monitoramento aceita apenas consultas SELECT',
        error: 'INVALID_QUERY_TYPE',
      });
    }
  }

  private async getPool(): Promise<ConnectionPool> {
    if (this.pool?.connected) {
      return this.pool;
    }

    if (this.connecting) {
      return this.connecting;
    }

    this.connecting = this.createPool();

    try {
      this.pool = await this.connecting;
      return this.pool;
    } finally {
      this.connecting = null;
    }
  }

  private async createPool(): Promise<ConnectionPool> {
    const server = this.configService.get<string>('SQLSERVER_MONITORING_SERVER');
    const user = this.configService.get<string>('SQLSERVER_MONITORING_USER');
    const password = this.configService.get<string>('SQLSERVER_MONITORING_PASSWORD');
    const database = this.configService.get<string>('SQLSERVER_MONITORING_DATABASE') || 'master';

    if (!server || !user || !password) {
      const missing: string[] = [];
      if (!server) missing.push('SQLSERVER_MONITORING_SERVER');
      if (!user) missing.push('SQLSERVER_MONITORING_USER');
      if (!password) missing.push('SQLSERVER_MONITORING_PASSWORD');

      this.logger.error('Monitoring database configuration missing', new Error('Missing config'), {
        missingVars: missing,
      });
      throw new Error(`Monitoring database configuration missing. Missing: ${missing.join(', ')}`);
    }

    this.logger.info('Connecting to monitoring database', {
      server,
      database,
      user: user.substring(0, 2) + '***', // Don't log full username
    });

    const pool = new ConnectionPool({
      user,
      password,
      server,
      database,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      connectionTimeout: 15000,
      requestTimeout: 60000, // Longer timeout for DMV queries
    });

    try {
      await pool.connect();
      this.logger.info('Database connection', { database: 'MONITORING:master', success: true });
      return pool;
    } catch (error: any) {
      this.logger.error('Failed to connect to monitoring database', error, {
        server,
        database,
        errorCode: error?.code,
        errorNumber: error?.number,
      });
      throw error;
    }
  }

  /**
   * Execute a read-only SQL query for monitoring purposes.
   * This method ONLY allows SELECT queries.
   *
   * @param query The SELECT query to execute
   * @param params Parameters for the query
   * @returns Query results
   */
  async executeReadOnlyQuery(query: string, params: any[] = []): Promise<any> {
    // CRITICAL: Validate query is read-only before executing
    this.validateReadOnlyQuery(query);

    const startTime = Date.now();

    try {
      const pool = await this.getPool();
      const request = pool.request();

      params.forEach((value, index) => {
        const paramName = `param${index + 1}`;
        request.input(paramName, value);
      });

      const result = await request.query(query);
      const executionTime = Date.now() - startTime;
      const rowCount = result.recordset?.length || 0;

      this.logger.debug('Query executed', {
        queryLength: query.length,
        paramCount: params.length,
        durationMs: executionTime,
        rowCount,
      });

      return result.recordset;
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      this.logger.error('[MONITORING] SQL execution failed', error, {
        queryPreview: query.substring(0, 100),
        params,
        executionTime,
      });

      throw error;
    }
  }

  /**
   * Test the monitoring database connection
   */
  async ping(): Promise<{ connected: boolean; error?: string }> {
    try {
      const pool = await this.getPool();
      return { connected: pool.connected };
    } catch (error: any) {
      return { connected: false, error: error?.message || 'Connection failed' };
    }
  }

  async onModuleDestroy() {
    if (this.pool?.connected) {
      await this.pool.close();
      this.logger.info('Closed monitoring database connection pool');
    }
  }
}
