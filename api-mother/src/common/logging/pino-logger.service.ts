import { Injectable } from '@nestjs/common';

export enum PinoLogLevel {
  ERROR = '\x1b[31m',
  SUCCESS = '\x1b[32m',
  WARN = '\x1b[33m',
  INFO = '\x1b[36m',
  DEBUG = '\x1b[90m',
  RESET = '\x1b[0m',
}

export interface PinoLogContext {
  userId?: string;
  codUsuario?: number;
  ip?: string;
  database?: string;
  query?: string;
  executionTime?: number;
  rowCount?: number;
  operation?: string;
  table?: string;
  [key: string]: any;
}

/**
 * @deprecated Use StructuredLogger instead.
 * This class is kept for backward compatibility with spec files only.
 * No production code should import or use this class.
 */
@Injectable()
export class PinoLogger {
  private formatMessage(level: PinoLogLevel, icon: string, message: string, context?: PinoLogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `${level}[${timestamp}] ${icon} ${message}${contextStr}${PinoLogLevel.RESET}\n`;
  }

  error(message: string, error?: Error, context?: PinoLogContext): void {
    const errorInfo = error ? ` | ${error.message}` : '';
    const formatted = this.formatMessage(PinoLogLevel.ERROR, '[X]', `${message}${errorInfo}`, context);
    process.stderr.write(formatted);
    if (error?.stack) {
      process.stderr.write(error.stack + '\n');
    }
  }

  successQuery(message: string, context: PinoLogContext): void {
    const formatted = this.formatMessage(PinoLogLevel.SUCCESS, '[V]', message, context);
    process.stdout.write(formatted);
  }

  warn(message: string, context?: PinoLogContext): void {
    const formatted = this.formatMessage(PinoLogLevel.WARN, '[!]', message, context);
    process.stderr.write(formatted);
  }

  info(message: string, context?: PinoLogContext): void {
    const formatted = this.formatMessage(PinoLogLevel.INFO, '[i]', message, context);
    process.stdout.write(formatted);
  }

  debug(message: string, context?: PinoLogContext): void {
    const formatted = this.formatMessage(PinoLogLevel.DEBUG, '[?]', message, context);
    process.stdout.write(formatted);
  }

  login(username: string, success: boolean, ip?: string, database?: string): void {
    const icon = success ? '[Y]' : '[X]';
    const color = success ? PinoLogLevel.WARN : PinoLogLevel.ERROR;
    const msg = success ? `LOGIN OK: ${username}` : `LOGIN FAILED: ${username}`;
    const formatted = this.formatMessage(color, icon, msg, { ip, database });
    if (success) {
      process.stdout.write(formatted);
    } else {
      process.stderr.write(formatted);
    }
  }

  queryExecuted(
    codUsuario: number,
    query: string,
    executionTime: number,
    rowCount: number,
    success: boolean,
    database?: string,
  ): void {
    const icon = success ? '[V]' : '[X]';
    const color = success ? PinoLogLevel.SUCCESS : PinoLogLevel.ERROR;
    const message = success ? `QUERY OK | ${rowCount} rows | ${executionTime}ms` : `QUERY FAILED | ${executionTime}ms`;
    const context: PinoLogContext = {
      codUsuario,
      database,
      executionTime,
      rowCount,
      queryLength: query.length,
    };
    const formatted = this.formatMessage(color, icon, message, context);
    if (success) {
      process.stdout.write(formatted);
    } else {
      process.stderr.write(formatted);
    }
  }

  databaseOperation(operation: string, database: string, success: boolean, duration?: number): void {
    const icon = success ? '[V]' : '[X]';
    const color = success ? PinoLogLevel.SUCCESS : PinoLogLevel.ERROR;
    const message = success ? `DB ${operation} OK` : `DB ${operation} FAILED`;
    const formatted = this.formatMessage(color, icon, message, { database, duration });
    if (success) {
      process.stdout.write(formatted);
    } else {
      process.stderr.write(formatted);
    }
  }

  permissionDenied(codUsuario: number, table: string, query: string): void {
    const formatted = this.formatMessage(
      PinoLogLevel.WARN,
      '[!]',
      `PERMISSION DENIED | User: ${codUsuario} | Table: ${table}`,
      { codUsuario, table, queryLength: query.length },
    );
    process.stderr.write(formatted);
  }

  rateLimitExceeded(codUsuario: number): void {
    const formatted = this.formatMessage(PinoLogLevel.WARN, '[!]', `RATE LIMIT EXCEEDED | User: ${codUsuario}`, {
      codUsuario,
    });
    process.stderr.write(formatted);
  }
}
