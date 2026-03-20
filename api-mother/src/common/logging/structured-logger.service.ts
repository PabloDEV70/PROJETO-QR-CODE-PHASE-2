import { Injectable } from '@nestjs/common';
import pino from 'pino';
import { getRequestContext, getCorrelationId } from './correlation-id.context';

const SENSITIVE_FIELDS = new Set([
  'password', 'token', 'accessToken', 'refreshToken', 'authorization',
]);

function redact(metadata?: Record<string, any>): Record<string, any> {
  if (!metadata) return {};
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(metadata)) {
    result[key] = SENSITIVE_FIELDS.has(key) ? '[REDACTED]' : value;
  }
  return result;
}

const pinoInstance = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label: string) => ({ level: label }),
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  base: undefined,
});

@Injectable()
export class StructuredLogger {
  private buildEntry(message: string, metadata?: Record<string, any>): Record<string, any> {
    const ctx = getRequestContext();
    return {
      correlationId: getCorrelationId(),
      database: ctx?.database,
      path: ctx?.path,
      method: ctx?.method,
      message,
      ...redact(metadata),
    };
  }

  info(message: string, metadata?: Record<string, any>): void {
    pinoInstance.info(this.buildEntry(message, metadata));
  }

  warn(message: string, metadata?: Record<string, any>): void {
    pinoInstance.warn(this.buildEntry(message, metadata));
  }

  debug(message: string, metadata?: Record<string, any>): void {
    pinoInstance.debug(this.buildEntry(message, metadata));
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    const entry = this.buildEntry(message, metadata);
    if (error) {
      entry['error'] = { name: error.name, message: error.message, stack: error.stack };
    }
    pinoInstance.error(entry);
  }
}
