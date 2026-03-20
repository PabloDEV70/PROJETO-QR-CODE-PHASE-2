import { Injectable, Logger } from '@nestjs/common';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface LogContext {
  userId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  duration?: number;
  statusCode?: number;
  [key: string]: any;
}

@Injectable()
export class AppLogger {
  private readonly logger = new Logger('API-Sankhya');

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';

    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  logRequest(context: LogContext): void {
    const message = `${context.method} ${context.url}`;
    this.logger.log(
      this.formatMessage(LogLevel.INFO, message, {
        ip: context.ip,
        userAgent: context.userAgent,
      }),
    );
  }

  logResponse(context: LogContext): void {
    const message = `${context.method} ${context.url} - ${context.statusCode} (${context.duration}ms)`;
    this.logger.log(
      this.formatMessage(LogLevel.INFO, message, {
        statusCode: context.statusCode,
        duration: context.duration,
      }),
    );
  }

  logError(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : undefined,
    };

    this.logger.error(this.formatMessage(LogLevel.ERROR, message, errorContext));
  }

  logWarning(message: string, context?: LogContext): void {
    this.logger.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  logInfo(message: string, context?: LogContext): void {
    this.logger.log(this.formatMessage(LogLevel.INFO, message, context));
  }

  logDebug(message: string, context?: LogContext): void {
    this.logger.debug(this.formatMessage(LogLevel.DEBUG, message, context));
  }

  logQuery(query: string, params: any[], duration: number, rowCount?: number): void {
    const context = {
      queryLength: query.length,
      paramCount: params.length,
      duration,
      rowCount,
    };

    this.logger.debug(this.formatMessage(LogLevel.DEBUG, 'SQL Query executed', context));
  }

  logAuth(username: string, success: boolean, ip?: string): void {
    const message = `Auth ${success ? 'success' : 'failed'} for user: ${username}`;
    const context = {
      username,
      success,
      ip,
      timestamp: new Date().toISOString(),
    };

    if (success) {
      this.logInfo(message, context);
    } else {
      this.logWarning(message, context);
    }
  }

  logDatabaseConnection(database: string, success: boolean, duration?: number): void {
    const message = `Database connection to ${database} ${success ? 'established' : 'failed'}`;
    const context = {
      database,
      success,
      duration,
    };

    if (success) {
      this.logInfo(message, context);
    } else {
      this.logError(message, undefined, context);
    }
  }
}
