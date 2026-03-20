import { Injectable } from '@nestjs/common';

/**
 * Result of SQL validation check
 */
export interface SqlValidationResult {
  /** Whether the SQL statement is valid and allowed */
  valid: boolean;
  /** Reason why the SQL was blocked (if invalid) */
  reason?: string;
  /** List of blocked keywords found in the SQL (if invalid) */
  blockedKeywords?: string[];
}

/**
 * Service for validating SQL statements against security policies.
 * Blocks dangerous DDL and system operations while allowing safe DML operations.
 */
@Injectable()
export class SqlValidationService {
  /**
   * DDL operations that are strictly prohibited
   */
  private readonly DDL_KEYWORDS = ['CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'RENAME'];

  /**
   * Dangerous system operations and stored procedures
   */
  private readonly DANGEROUS_KEYWORDS = ['EXEC', 'EXECUTE', 'xp_', 'sp_executesql', 'WAITFOR', 'OPENROWSET'];

  /**
   * Dynamic SQL execution patterns (e.g., EXEC('...') or EXECUTE('...'))
   */
  private readonly DYNAMIC_SQL_PATTERNS: RegExp[] = [
    /exec\s*\(/i,
    /execute\s*\(/i,
  ];

  /**
   * Allowed DML operations (Data Manipulation Language)
   */
  private readonly ALLOWED_DML = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];

  /**
   * Validate an SQL statement against security policies
   * @param sql - The SQL statement to validate
   * @returns Validation result with details if blocked
   */
  validateSql(sql: string): SqlValidationResult {
    if (!sql || !sql.trim()) {
      return {
        valid: false,
        reason: 'SQL statement is empty or null',
      };
    }

    const normalizedSql = sql.toUpperCase().trim();
    const blockedKeywords: string[] = [];

    // Check for DDL operations
    for (const keyword of this.DDL_KEYWORDS) {
      if (this.containsKeyword(normalizedSql, keyword)) {
        blockedKeywords.push(keyword);
      }
    }

    // Check for dangerous operations
    for (const keyword of this.DANGEROUS_KEYWORDS) {
      if (this.containsKeyword(normalizedSql, keyword)) {
        blockedKeywords.push(keyword);
      }
    }

    // Check for dynamic SQL execution patterns (e.g., EXEC('...'))
    for (const pattern of this.DYNAMIC_SQL_PATTERNS) {
      if (pattern.test(sql)) {
        blockedKeywords.push('DYNAMIC_SQL');
      }
    }

    // If any blocked keywords found, reject the SQL
    if (blockedKeywords.length > 0) {
      return {
        valid: false,
        reason: `SQL contains prohibited operations: ${blockedKeywords.join(', ')}`,
        blockedKeywords,
      };
    }

    // Check if SQL starts with an allowed DML operation
    const startsWithAllowedOperation = this.ALLOWED_DML.some((operation) => {
      const pattern = new RegExp(`^\\s*${operation}\\b`, 'i');
      return pattern.test(sql);
    });

    if (!startsWithAllowedOperation) {
      return {
        valid: false,
        reason: `SQL must start with one of: ${this.ALLOWED_DML.join(', ')}`,
      };
    }

    // SQL is valid
    return { valid: true };
  }

  /**
   * Check if SQL contains a specific keyword (case-insensitive, whole word match).
   * Keywords ending with '_' (e.g., 'xp_') are treated as prefixes — matched with
   * a leading word boundary only so that 'xp_cmdshell' is detected correctly.
   * @param sql - The normalized SQL (uppercase) to check
   * @param keyword - The keyword to search for
   * @returns True if keyword is found
   */
  private containsKeyword(sql: string, keyword: string): boolean {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const trailingBoundary = keyword.endsWith('_') ? '' : '\\b';
    const pattern = new RegExp(`\\b${escaped}${trailingBoundary}`, 'i');
    return pattern.test(sql);
  }

  /**
   * Check if an SQL statement is safe (convenience method)
   * @param sql - The SQL statement to check
   * @returns True if SQL is safe to execute
   */
  isSqlSafe(sql: string): boolean {
    return this.validateSql(sql).valid;
  }
}
