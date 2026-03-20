import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { DatabaseContextService } from '../database/database-context.service';
import { DatabaseKey } from '../config/database.config';
import { TablePermissionService } from './table-permission.service';
import { AuditService } from './audit.service';
import { BossApprovalValidator } from './boss-approval-validator.service';

/**
 * Guard for enforcing table-level write operation permissions
 *
 * SECURITY POLICY:
 * - PROD: Only whitelisted tables (AD_RDOAPONTAMENTOS, etc) with x-boss-approval
 * - TESTE: All tables allowed without restrictions
 * - TREINA: No tables allowed (hard block)
 *
 * Validates:
 * 1. SQL operation type (INSERT/UPDATE/DELETE/PATCH)
 * 2. Target table name extraction
 * 3. Table permissions by database
 * 4. Boss approval requirement
 *
 * NOTE: PATCH operations are treated as UPDATE (partial update)
 *
 * @see TablePermissionService for permission logic
 * @see TABLE_WRITE_PERMISSIONS for whitelist configuration
 *
 * @example
 * @UseGuards(DatabaseWriteGuard, TableWritePermissionGuard)
 * @Post('query')
 * async executeQuery(@Body() body: QueryRequestDto) { }
 */
@Injectable()
export class TableWritePermissionGuard implements CanActivate {
  private readonly logger = new Logger(TableWritePermissionGuard.name);

  constructor(
    private readonly tablePermissionService: TablePermissionService,
    private readonly databaseContext: DatabaseContextService,
    private readonly auditService: AuditService,
    private readonly bossApprovalValidator: BossApprovalValidator,
  ) {}

  /**
   * Determine if write operation is allowed
   *
   * @param context - The execution context
   * @returns true if operation is allowed
   * @throws ForbiddenException if operation is not allowed
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract database from context (set by middleware)
    const database = this.databaseContext.getCurrentDatabase();

    // Extract SQL from request body
    const sql = this.extractSql(request);

    // If no SQL found, let other guards handle it
    if (!sql) {
      return true;
    }

    // Detect operation type (INSERT/UPDATE/DELETE/PATCH)
    // NOTE: PATCH is treated as UPDATE (partial update)
    const operation = this.detectOperation(sql);

    // If not a write operation, allow it (read-only query)
    if (!operation) {
      return true;
    }

    // Extract table name from SQL
    const tableName = this.extractTableName(sql, operation);

    if (!tableName) {
      this.logger.warn(`Could not extract table name from ${operation} query`);

      // Log failed extraction
      await this.logBlockedOperation(request, database, 'UNKNOWN', operation, sql, {
        reason: 'TABLE_NAME_EXTRACTION_FAILED',
        message: 'Could not extract table name from SQL',
      });

      throw new ForbiddenException({
        code: 'TABLE_NAME_EXTRACTION_FAILED',
        message: `Could not extract table name from ${operation} query`,
        database,
      });
    }

    // Check if write operation is allowed on this table
    const allowed = this.tablePermissionService.isWriteAllowed(tableName, database, operation);

    if (!allowed) {
      // Log blocked operation
      await this.logBlockedOperation(request, database, tableName, operation, sql, {
        reason: 'TABLE_WRITE_NOT_ALLOWED',
        message: `Write operation not allowed on table ${tableName} in ${database} environment`,
      });

      throw new ForbiddenException({
        code: 'TABLE_WRITE_NOT_ALLOWED',
        message: `Operação ${operation} não permitida na tabela ${tableName} no ambiente ${database}`,
        tableName,
        operation,
        database,
        allowedTables: this.tablePermissionService.getAllowedTables(database),
      });
    }

    // Check if boss approval is required
    if (this.tablePermissionService.requiresBossApproval(tableName, database)) {
      const bossApprovalToken = this.extractBossApprovalToken(request);

      if (!bossApprovalToken) {
        // Log missing approval
        await this.logBlockedOperation(request, database, tableName, operation, sql, {
          reason: 'BOSS_APPROVAL_REQUIRED',
          message: `x-boss-approval header required for ${operation} on ${tableName}`,
        });

        throw new ForbiddenException({
          code: 'BOSS_APPROVAL_REQUIRED',
          message: `Operação ${operation} na tabela ${tableName} requer header x-boss-approval`,
          tableName,
          operation,
        });
      }

      // Full JWT validation: signature + expiry + claims
      // Throws ForbiddenException with ERR_BOSS_TOKEN_INVALID on any failure
      this.bossApprovalValidator.validateApprovalToken(bossApprovalToken);
      this.logger.debug(`Boss approval validated for ${operation} on ${tableName} (${database})`);
    }

    // Operation is allowed - log success
    this.logger.debug(`Write operation allowed: ${operation} on ${tableName} (${database})`);

    return true;
  }

  /**
   * Extract SQL statement from request body
   *
   * @param request - HTTP request object
   * @returns SQL string or null
   */
  private extractSql(request: Request): string | null {
    const body = request.body as any;

    if (body?.query && typeof body.query === 'string') {
      return body.query;
    }

    if (body?.sql && typeof body.sql === 'string') {
      return body.sql;
    }

    return null;
  }

  /**
   * Detect operation type from SQL statement
   *
   * NOTE: PATCH operations are treated as UPDATE (partial update).
   *
   * @param sql - SQL statement
   * @returns Operation type or null
   */
  private detectOperation(sql: string): 'INSERT' | 'UPDATE' | 'DELETE' | null {
    if (!sql) return null;

    const normalized = sql.trim().toUpperCase();

    if (normalized.startsWith('INSERT')) return 'INSERT';
    if (normalized.startsWith('UPDATE')) return 'UPDATE';
    if (normalized.startsWith('PATCH')) return 'UPDATE'; // Treat PATCH as UPDATE
    if (normalized.startsWith('DELETE')) return 'DELETE';

    return null;
  }

  /**
   * Extract table name from SQL statement
   *
   * Handles:
   * - INSERT INTO table_name ...
   * - UPDATE table_name SET ...
   * - PATCH table_name SET ... (treated as UPDATE)
   * - DELETE FROM table_name ...
   *
   * @param sql - SQL statement
   * @param operation - Operation type
   * @returns Table name or null
   */
  private extractTableName(sql: string, operation: 'INSERT' | 'UPDATE' | 'DELETE'): string | null {
    if (!sql || !operation) return null;

    try {
      const normalized = sql.trim().toUpperCase();

      if (operation === 'INSERT') {
        // INSERT INTO table_name ...
        // Also handles: INSERT INTO [schema].table_name
        const match = normalized.match(/INSERT\s+INTO\s+(?:\[?(\w+)\]?\.)?(?:\[?(\w+)\]?)/i);
        if (match) {
          // Return the table name (group 2 if schema is present, group 1 otherwise)
          return match[2] || match[1];
        }
      }

      if (operation === 'UPDATE') {
        // UPDATE/PATCH table_name SET ...
        // Also handles: UPDATE/PATCH [schema].table_name
        // Supports both UPDATE and PATCH syntax
        const match = normalized.match(/(?:UPDATE|PATCH)\s+(?:\[?(\w+)\]?\.)?(?:\[?(\w+)\]?)/i);
        if (match) {
          return match[2] || match[1];
        }
      }

      if (operation === 'DELETE') {
        // DELETE FROM table_name ...
        // Also handles: DELETE FROM [schema].table_name
        const match = normalized.match(/DELETE\s+FROM\s+(?:\[?(\w+)\]?\.)?(?:\[?(\w+)\]?)/i);
        if (match) {
          return match[2] || match[1];
        }
      }
    } catch (error) {
      this.logger.error(`Error extracting table name: ${(error as Error).message}`);
    }

    return null;
  }

  /**
   * Extract boss approval token from request headers
   *
   * @param request - HTTP request object
   * @returns Token string or null
   */
  private extractBossApprovalToken(request: Request): string | null {
    const token = request.headers['x-boss-approval'] as string;
    return token && token.trim() ? token : null;
  }

  /**
   * Log blocked operation to audit service
   *
   * @param request - HTTP request object
   * @param database - Target database
   * @param tableName - Target table
   * @param operation - Operation type
   * @param sql - SQL statement
   * @param blockInfo - Block reason information
   */
  private async logBlockedOperation(
    request: Request,
    database: DatabaseKey,
    tableName: string,
    operation: string,
    sql: string,
    blockInfo: { reason: string; message: string },
  ): Promise<void> {
    const user = (request.user as any)?.username || 'unknown';
    const ip = request.ip || request.socket.remoteAddress || 'unknown';

    await this.auditService.logOperation({
      timestamp: new Date().toISOString(),
      user,
      ip,
      database,
      operation: `${operation} ${tableName}`,
      sql,
      success: false,
      error: `[${blockInfo.reason}] ${blockInfo.message}`,
    });

    this.logger.warn(
      `Blocked operation: ${user} attempted ${operation} on ${tableName} (${database}) - ${blockInfo.reason}`,
    );
  }
}
