import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Interface for audit log entry containing all operation details
 */
export interface AuditLogEntry {
  /** ISO timestamp of when the operation occurred */
  timestamp: string;
  /** Username or identifier of the user performing the operation */
  user: string;
  /** IP address of the client making the request */
  ip: string;
  /** Target database name (TESTE, TREINA, PROD) */
  database: string;
  /** Type of operation (SELECT, INSERT, UPDATE, DELETE, etc.) */
  operation: string;
  /** SQL statement (sanitized - sensitive data removed) */
  sql: string;
  /** Whether the operation completed successfully */
  success: boolean;
  /** Error message if operation failed */
  error?: string;
  /** Duration of the operation in milliseconds */
  duration?: number;
}

/**
 * Service for comprehensive audit logging of database operations.
 * Logs all operations to daily rotating JSON line files for security and compliance.
 */
@Injectable()
export class AuditService {
  private readonly logsDir = path.join(process.cwd(), 'apps', 'api', 'logs');

  /**
   * Log a database operation with full audit trail
   * @param details - The audit log entry containing all operation details
   * @returns Promise that resolves when log is written
   */
  async logOperation(details: AuditLogEntry): Promise<void> {
    try {
      // Ensure logs directory exists
      await this.ensureLogsDirectory();

      // Generate daily log filename
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const logFile = path.join(this.logsDir, `audit-${today}.log`);

      // Sanitize SQL for logging (remove sensitive parameter values)
      const sanitizedSql = this.sanitizeSql(details.sql);

      // Create audit log entry
      const logEntry: AuditLogEntry = {
        ...details,
        sql: sanitizedSql,
        timestamp: details.timestamp || new Date().toISOString(),
      };

      // Write as JSON line (one JSON object per line)
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(logFile, logLine, 'utf-8');
    } catch (error) {
      // Don't throw - audit logging should never break the application
      const entry = JSON.stringify({
        time: new Date().toISOString(),
        level: 'error',
        correlationId: 'AUDIT_SERVICE',
        message: 'Failed to write audit log',
        error: error instanceof Error ? error.message : String(error),
      }) + '\n';
      process.stderr.write(entry);
    }
  }

  /**
   * Ensure the logs directory exists, create if it doesn't
   */
  private async ensureLogsDirectory(): Promise<void> {
    try {
      await fs.access(this.logsDir);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(this.logsDir, { recursive: true });
    }
  }

  /**
   * Sanitize SQL statement by removing sensitive parameter values
   * Replaces actual values with placeholders for security
   * @param sql - The SQL statement to sanitize
   * @returns Sanitized SQL statement
   */
  private sanitizeSql(sql: string): string {
    if (!sql) return '';

    // Replace string literals with [STRING]
    let sanitized = sql.replace(/'[^']*'/g, "'[STRING]'");

    // Replace numeric literals with [NUMBER]
    sanitized = sanitized.replace(/\b\d+(\.\d+)?\b/g, '[NUMBER]');

    return sanitized;
  }
}
