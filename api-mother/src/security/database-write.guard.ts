import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { DatabaseContextService } from '../database/database-context.service';
import { DatabaseKey } from '../config/database.config';
import { AuditService } from './audit.service';
import { BossApprovalValidator } from './boss-approval-validator.service';

/**
 * Guard that enforces database write restrictions based on environment.
 *
 * SECURITY POLICY:
 * - TESTE: All write operations allowed
 * - TREINA: ALL write operations BLOCKED (hard block)
 * - PROD: Write operations require boss approval token (hard block without token)
 *
 * This guard should be applied to all endpoints that perform write operations.
 */
@Injectable()
export class DatabaseWriteGuard implements CanActivate {
  /**
   * Databases that allow write operations without restrictions
   */
  private readonly ALLOWED_WRITE_DATABASES: DatabaseKey[] = ['TESTE'];

  /**
   * HTTP methods that are considered write operations
   */
  private readonly WRITE_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

  constructor(
    private readonly databaseContext: DatabaseContextService,
    private readonly auditService: AuditService,
    private readonly bossApprovalValidator: BossApprovalValidator,
  ) {}

  /**
   * Determine if the request should be allowed based on database and operation type
   * @param context - The execution context containing request details
   * @returns True if request is allowed, throws ForbiddenException if blocked
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract database from context (set by middleware)
    const database = this.databaseContext.getCurrentDatabase();

    // Extract operation type from HTTP method
    const method = request.method.toUpperCase();
    const isWriteOperation = this.WRITE_METHODS.includes(method);

    // If it's a read operation (GET), always allow
    if (!isWriteOperation) {
      return true;
    }

    // Special case: POST with SELECT query is actually a read operation
    // Allow SELECT queries on any database (they don't modify data)
    if (method === 'POST' && this.isReadOnlyQuery(request)) {
      return true;
    }

    // Extract user and IP for audit logging
    const user = (request.user as any)?.username || 'unknown';
    const ip = request.ip || request.socket.remoteAddress || 'unknown';

    // Check write operation permissions based on database
    const blockResult = this.checkWritePermission(database, request);

    if (blockResult.blocked) {
      // Log blocked attempt
      await this.auditService.logOperation({
        timestamp: new Date().toISOString(),
        user,
        ip,
        database,
        operation: `${method} ${request.path}`,
        sql: this.extractSqlFromRequest(request),
        success: false,
        error: blockResult.reason,
      });

      // Throw forbidden exception
      throw new ForbiddenException({
        message: blockResult.reason,
        code: 'DATABASE_WRITE_BLOCKED',
        database,
        operation: method,
      });
    }

    // Operation is allowed
    return true;
  }

  /**
   * Check if write operation should be blocked based on database and approval
   * @param database - The target database
   * @param request - The HTTP request object
   * @returns Object indicating if blocked and reason
   */
  private checkWritePermission(database: DatabaseKey, request: Request): { blocked: boolean; reason?: string } {
    // HARD BLOCK: TREINA database - NO write operations allowed
    if (database === 'TREINA') {
      return {
        blocked: true,
        reason: 'Write operations are STRICTLY PROHIBITED on TREINA database',
      };
    }

    // CONDITIONAL BLOCK: PROD database - requires boss approval
    if (database === 'PROD') {
      const bossApprovalToken = request.headers['x-boss-approval'] as string;

      if (!bossApprovalToken || bossApprovalToken.trim() === '') {
        return {
          blocked: true,
          reason: 'Write operations on PROD database require boss approval token (x-boss-approval header)',
        };
      }

      // Full JWT validation: signature + expiry + claims
      // Throws ForbiddenException with ERR_BOSS_TOKEN_INVALID on any failure
      this.bossApprovalValidator.validateApprovalToken(bossApprovalToken);
      return { blocked: false };
    }

    // ALLOWED: TESTE database
    if (this.ALLOWED_WRITE_DATABASES.includes(database)) {
      return { blocked: false };
    }

    // Unknown database - block by default (fail-safe)
    return {
      blocked: true,
      reason: `Write operations not allowed on database: ${database}`,
    };
  }

  /**
   * Extract SQL statement from request body for audit logging
   * @param request - The HTTP request object
   * @returns SQL statement or operation description
   */
  private extractSqlFromRequest(request: Request): string {
    const body = request.body;

    if (body?.query) {
      return body.query;
    }

    if (body?.sql) {
      return body.sql;
    }

    // If no SQL in body, return operation description
    return `${request.method} ${request.path}`;
  }

  /**
   * Check if the request body contains a read-only SQL query (SELECT only)
   * @param request - The HTTP request object
   * @returns True if query is read-only SELECT
   */
  private isReadOnlyQuery(request: Request): boolean {
    const query = this.extractSqlFromRequest(request);

    // Normalize query for analysis
    const normalizedQuery = query.trim().toUpperCase();

    // Must start with SELECT
    if (!normalizedQuery.startsWith('SELECT')) {
      return false;
    }

    // Block any write keywords that could be in a subquery or CTE
    const writeKeywords = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE', 'EXEC', 'EXECUTE'];
    for (const keyword of writeKeywords) {
      // Check for keyword as a standalone word (not part of column/table name)
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(query)) {
        return false;
      }
    }

    return true;
  }
}
