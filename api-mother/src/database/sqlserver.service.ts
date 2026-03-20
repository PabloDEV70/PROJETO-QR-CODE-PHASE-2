import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConnectionPool, Request } from 'mssql'; // Import Request here
import * as sql from 'mssql'; // Corrected mssql import
import { ConnectionPoolManager } from './connection-pool-manager.service';
import { DatabaseContextService } from './database-context.service';
import { StructuredLogger } from '../common/logging/structured-logger.service';
import { DatabaseException } from '../common/exceptions/database.exception'; // Import DatabaseException

/**
 * Defines a SQL statement with its corresponding parameters.
 * Used for executing multiple statements in a transaction securely.
 */
export interface ParameterizedSqlStatement {
  query: string;
  parameters?: any[];
}

@Injectable()
export class SqlServerService {
  /**
   * List of SQL operations that modify data (WRITE operations)
   * These are FORBIDDEN on SANKHYA_PROD until IT manager approval
   */
  private readonly WRITE_OPERATIONS = [
    'INSERT',
    'UPDATE',
    'DELETE',
    'ALTER',
    'DROP',
    'CREATE',
    'TRUNCATE',
    'MERGE',
    'EXEC',
    'EXECUTE',
  ];

  constructor(
    private poolManager: ConnectionPoolManager,
    private databaseContext: DatabaseContextService,
    private logger: StructuredLogger,
  ) {}

  private async getPool(): Promise<ConnectionPool> {
    const databaseKey = this.databaseContext.getCurrentDatabase();
    return this.poolManager.getPool(databaseKey);
  }

  /**
   * 🚨 CRITICAL SECURITY VALIDATION 🚨
   *
   * Validates that NO WRITE operations are executed on SANKHYA_PROD
   * This is a MANDATORY security measure until IT manager approval.
   *
   * @param query - SQL query to validate
   * @param database - Database name to check
   * @throws ForbiddenException if WRITE operation detected on SANKHYA_PROD
   */
  private validateReadOnlyProd(query: string, database: string): void {
    // Only enforce READ-ONLY on SANKHYA_PROD
    if (database !== 'SANKHYA_PROD') {
      return;
    }

    const upperQuery = query.toUpperCase().trim();

    // Check for WRITE operations
    for (const operation of this.WRITE_OPERATIONS) {
      if (upperQuery.startsWith(operation)) {
        // Log CRITICAL security violation
        this.logger.error(
          '⛔ WRITE OPERATION BLOCKED ON SANKHYA_PROD',
          new Error('Unauthorized write attempt on production database'),
          {
            database,
            operation,
            query: query.substring(0, 100), // Log first 100 chars only
            timestamp: new Date().toISOString(),
          },
        );

        throw new ForbiddenException(
          `⛔ WRITE operation '${operation}' is FORBIDDEN on SANKHYA_PROD. ` +
            `This database is READ-ONLY until IT manager approval. ` +
            `Use SANKHYA_TESTE or SANKHYA_TREINA for testing.`,
        );
      }
    }
  }

  async executeSQL(query: string, params: any[]): Promise<any> {
    const startTime = Date.now();
    const databaseKey = this.databaseContext.getCurrentDatabase();

    // 🚨 CRITICAL: Validate READ-ONLY on SANKHYA_PROD
    this.validateReadOnlyProd(query, databaseKey);

    try {
      const pool = await this.getPool();
      this.logger.info('Database connection', { database: databaseKey, success: true });

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
    } catch (error) {
      const executionTime = Date.now() - startTime;

      this.logger.error('SQL execution failed', error as Error, {
        query,
        params,
        executionTime,
        database: databaseKey,
      });

      throw new DatabaseException('An error occurred while executing the SQL query.', {
        database: databaseKey,
        query: query,
        params: params,
        originalError: {
          message: (error as Error)?.message || error,
          name: (error as Error)?.name,
        },
      });
    }
  }

  async ping(): Promise<{ connected: boolean; database?: string; error?: string }> {
    try {
      const databaseKey = this.databaseContext.getCurrentDatabase();
      const pool = await this.getPool();
      return { connected: pool.connected, database: databaseKey };
    } catch (error) {
      return { connected: false, error: error?.message || 'Connection failed' };
    }
  }

  /**
   * Execute multiple SQL statements within a transaction.
   * CRITICAL: Each statement MUST be parameterized to prevent SQL injection.
   *
   * @param parameterizedStatements - An array of objects, each containing a SQL query
   *                                  string with placeholders and an array of parameters.
   */
  async executeInTransaction(parameterizedStatements: ParameterizedSqlStatement[]): Promise<void> {
    const databaseKey = this.databaseContext.getCurrentDatabase();

    // 🚨 CRITICAL: Validate ALL queries in transaction BEFORE executing
    for (const stmt of parameterizedStatements) {
      this.validateReadOnlyProd(stmt.query, databaseKey);
    }

    const pool = await this.getPool();
    const transaction = new sql.Transaction(pool);

    try {
      this.logger.info('BEGIN TRANSACTION', { database: databaseKey });

      await transaction.begin();

      for (let i = 0; i < parameterizedStatements.length; i++) {
        const { query, parameters = [] } = parameterizedStatements[i];
        this.logger.info(`Executing statement ${i + 1}/${parameterizedStatements.length}`, {
          sqlLength: query.length,
          hasParameters: parameters.length > 0,
          database: databaseKey,
        });

        const request = new Request(transaction);
        parameters.forEach((value, index) => {
          const paramName = `param${index + 1}`;
          request.input(paramName, value);
        });
        await request.query(query);
      }

      await transaction.commit();
      this.logger.info('COMMIT TRANSACTION', {
        database: databaseKey,
        statementsExecuted: parameterizedStatements.length,
      });
    } catch (error) {
      this.logger.error('Transaction failed - attempting rollback', error as Error, {
        database: databaseKey,
        statementsCount: parameterizedStatements.length,
      });

      try {
        await transaction.rollback();
        this.logger.warn('ROLLBACK completed', { database: databaseKey });
      } catch (rollbackError) {
        this.logger.error('ROLLBACK failed', rollbackError as Error, {
          database: databaseKey,
        });
      }

      throw new DatabaseException('An error occurred during a database transaction.', {
        database: databaseKey,
        statementsCount: parameterizedStatements.length,
        originalError: {
          message: (error as Error)?.message || error,
          name: (error as Error)?.name,
        },
      });
    }
  }
}
