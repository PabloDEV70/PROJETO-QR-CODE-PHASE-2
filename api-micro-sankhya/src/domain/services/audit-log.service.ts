import { logger } from '@/shared/logger';

export type AuditEventType =
  | 'login_success'
  | 'login_failed'
  | 'account_locked'
  | 'recovery_used';

interface AuditEntry {
  eventType: AuditEventType;
  loginType?: string;
  identifier: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

/**
 * Audit via structured logging (Pino JSON).
 * No SQLite dependency — logs go to stdout/file like all other logs.
 */
export function logAudit(entry: AuditEntry): void {
  logger.info(
    {
      audit: true,
      eventType: entry.eventType,
      loginType: entry.loginType ?? null,
      identifier: entry.identifier,
      ip: entry.ipAddress ?? null,
      ua: entry.userAgent ?? null,
      details: entry.details ?? null,
    },
    '[Audit] %s %s %s',
    entry.eventType,
    entry.loginType ?? '',
    entry.identifier,
  );
}
