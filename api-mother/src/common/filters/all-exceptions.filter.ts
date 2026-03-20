import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';
import { GatewayException } from '../exceptions/gateway.exception';
import { GatewayErrorCode } from '../enums/gateway-error-code.enum';
import { SqlErrorAnalyzerService } from '../services/sql-error-analyzer.service';
import { mapLegacyCode, mapStatusCode } from './error-code-mapper';

/**
 * Global catch-all exception filter.
 * Emits structured error envelope: { data, success, error: { code, message, context? }, meta }.
 *
 * Handles (in order):
 *  1. GatewayException   — uses .code and .context directly
 *  2. ThrottlerException — maps to ERR_RATE_LIMIT
 *  3. HttpException      — maps embedded code or HTTP status
 *  4. SQL-related Error  — analysed by SqlErrorAnalyzerService
 *  5. Fallback           — ERR_INTERNAL
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  // TODO: SqlErrorAnalyzerService is instantiated directly because this filter
  // is registered via useGlobalFilters(new AllExceptionsFilter()) in main.ts,
  // which bypasses the NestJS DI container. SqlErrorAnalyzerService has no
  // constructor dependencies so direct instantiation is safe.
  private readonly sqlErrorAnalyzer = new SqlErrorAnalyzerService();

  private readonly SQL_ERROR_PATTERNS = [
    /invalid object name/i,
    /invalid column name/i,
    /syntax error/i,
    /login failed/i,
    /permission denied/i,
    /connection/i,
    /timeout expired/i,
    /deadlock/i,
    /transaction/i,
    /constraint violation/i,
    /foreign key/i,
    /primary key/i,
    /duplicate key/i,
    /truncate/i,
    /arithmetic overflow/i,
    /conversion failed/i,
    /string or binary data would be truncated/i,
    /cannot insert the value null/i,
    /mssql/i,
    /tedious/i,
    /connection pool/i,
  ];

  private readonly SENSITIVE_PATTERNS = [
    /server=[^;]+/gi,
    /database=[^;]+/gi,
    /user\s*id=[^;]+/gi,
    /password=[^;]+/gi,
    /initial catalog=[^;]+/gi,
    /data source=[^;]+/gi,
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  ];

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { code, message, context, status } = this.classify(exception, request.url);

    response.status(status).json({
      data: null,
      success: false,
      error: {
        code,
        message,
        ...(Object.keys(context).length > 0 ? { context } : {}),
      },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  private classify(
    exception: unknown,
    path: string,
  ): { code: GatewayErrorCode; message: string; context: Record<string, unknown>; status: number } {
    // 1. GatewayException: use its typed code/context directly
    if (exception instanceof GatewayException) {
      return {
        code: exception.code,
        message: exception.message,
        context: exception.context ?? {},
        status: exception.getStatus(),
      };
    }

    // 2. ThrottlerException
    if (exception instanceof ThrottlerException) {
      return {
        code: GatewayErrorCode.ERR_RATE_LIMIT,
        message: 'Rate limit exceeded. Please slow down your requests.',
        context: {},
        status: HttpStatus.TOO_MANY_REQUESTS,
      };
    }

    // 3. HttpException (plain — guards embed legacy codes)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      let code = mapStatusCode(status);

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        const rawCode = typeof resp['code'] === 'string' ? resp['code'] : null;
        if (rawCode) {
          const mapped = mapLegacyCode(rawCode);
          if (mapped) code = mapped;
        }
      }

      const msgStr =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : String((exceptionResponse as Record<string, unknown>)['message'] ?? exception.message);

      return { code, message: msgStr, context: {}, status };
    }

    // 4. Plain Error — check for SQL patterns
    const rawMsg = exception instanceof Error ? exception.message : String(exception);
    if (this.isSqlRelatedError(rawMsg)) {
      this.logger.error(
        `SQL Error - Path: ${path} - Original: ${this.sanitizeForLog(rawMsg)}`,
        exception instanceof Error ? exception.stack : undefined,
      );

      const lowMsg = rawMsg.toLowerCase();
      let code = GatewayErrorCode.ERR_INTERNAL;

      if (lowMsg.includes('connection') || lowMsg.includes('login failed')) {
        code = GatewayErrorCode.ERR_DATABASE_CONNECTION;
      } else if (lowMsg.includes('deadlock')) {
        code = GatewayErrorCode.ERR_DATABASE_DEADLOCK;
      } else if (lowMsg.includes('timeout')) {
        code = GatewayErrorCode.ERR_DATABASE_TIMEOUT;
      } else {
        const analysis = this.sqlErrorAnalyzer.analyzeError(exception);
        code = this.mapSqlCategory(analysis.categoria);
      }

      return {
        code,
        message: this.getSanitizedSqlMessage(rawMsg),
        context: {},
        status: HttpStatus.BAD_REQUEST,
      };
    }

    // 5. Fallback
    this.logger.error(
      `Unhandled Exception - Path: ${path} - Message: ${rawMsg}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    return {
      code: GatewayErrorCode.ERR_INTERNAL,
      message: 'Internal server error.',
      context: {},
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  private mapSqlCategory(
    categoria: 'SINTAXE' | 'COLUNA' | 'TABELA' | 'PERMISSAO' | 'TIPO_DADO' | 'REFERENCIA' | 'DESCONHECIDO',
  ): GatewayErrorCode {
    switch (categoria) {
      case 'SINTAXE':
        return GatewayErrorCode.ERR_SQL_SYNTAX;
      case 'COLUNA':
        return GatewayErrorCode.ERR_SQL_INVALID_COLUMN;
      case 'TABELA':
        return GatewayErrorCode.ERR_SQL_INVALID_TABLE;
      case 'PERMISSAO':
        return GatewayErrorCode.ERR_SQL_PERMISSION_DENIED;
      case 'TIPO_DADO':
        return GatewayErrorCode.ERR_SQL_TYPE_MISMATCH;
      case 'REFERENCIA':
        return GatewayErrorCode.ERR_SQL_CONSTRAINT_VIOLATION;
      default:
        return GatewayErrorCode.ERR_INTERNAL;
    }
  }

  private isSqlRelatedError(message: string): boolean {
    if (!message) return false;
    return this.SQL_ERROR_PATTERNS.some((pattern) => pattern.test(message));
  }

  private sanitizeForLog(message: string): string {
    let sanitized = message;
    for (const pattern of this.SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
    return sanitized;
  }

  private getSanitizedSqlMessage(originalMessage: string): string {
    const lowercaseMsg = originalMessage.toLowerCase();

    if (lowercaseMsg.includes('invalid object name') || lowercaseMsg.includes('invalid column')) {
      return 'Table or column not found. Check the query.';
    }
    if (lowercaseMsg.includes('syntax error')) {
      return 'SQL syntax error. Check the query structure.';
    }
    if (lowercaseMsg.includes('permission denied')) {
      return 'Permission denied for this operation.';
    }
    if (lowercaseMsg.includes('login failed')) {
      return 'Database authentication failed.';
    }
    if (lowercaseMsg.includes('timeout') || lowercaseMsg.includes('connection')) {
      return 'Database connection error. Please try again.';
    }
    if (lowercaseMsg.includes('deadlock')) {
      return 'Database access conflict. Please try again.';
    }
    if (lowercaseMsg.includes('constraint') || lowercaseMsg.includes('duplicate key')) {
      return 'Data constraint violation. Check the values provided.';
    }
    if (lowercaseMsg.includes('truncated') || lowercaseMsg.includes('overflow')) {
      return 'Value exceeds the allowed limit for the field.';
    }
    if (lowercaseMsg.includes('cannot insert the value null')) {
      return 'Required field was not provided.';
    }
    return 'Error processing database operation.';
  }
}
