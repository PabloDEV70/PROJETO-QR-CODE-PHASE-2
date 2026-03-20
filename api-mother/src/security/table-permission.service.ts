import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TABLE_WRITE_PERMISSIONS, TablePermissionConfig } from '../config/table-permissions.config';
import { DatabaseKey } from '../config/database.config';

/**
 * Service for managing table-level write operation permissions
 *
 * Checks if a specific table is allowed for INSERT/UPDATE/DELETE/PATCH operations
 * based on the target database (PROD/TESTE/TREINA) and configured permissions.
 *
 * NOTE: PATCH operations follow the same rules as UPDATE (partial update).
 * No separate configuration is needed - use WRITE_ALLOWED_* env vars as usual.
 *
 * Supports:
 * - Config-file based permissions (TABLE_WRITE_PERMISSIONS)
 * - Environment variable overrides
 * - Wildcard patterns (*, AD_*, TSI*)
 * - Boss approval requirements
 */
@Injectable()
export class TablePermissionService {
  private readonly logger = new Logger(TablePermissionService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Check if write operation is allowed on a specific table
   *
   * @param tableName - Name of the target table
   * @param database - Target database (PROD, TESTE, TREINA)
   * @param operation - Type of operation (INSERT, UPDATE, DELETE, PATCH)
   * @returns true if operation is allowed, false otherwise
   *
   * NOTE: PATCH operations follow the same rules as UPDATE (partial update).
   *
   * @example
   * const allowed = service.isWriteAllowed('AD_RDOAPONTAMENTOS', 'PROD', 'INSERT');
   * const patchAllowed = service.isWriteAllowed('AD_RDOAPONTAMENTOS', 'PROD', 'UPDATE'); // PATCH uses UPDATE rules
   */
  isWriteAllowed(tableName: string, database: DatabaseKey, operation: 'INSERT' | 'UPDATE' | 'DELETE'): boolean {
    if (!tableName || !database || !operation) {
      this.logger.warn('Missing required parameters for permission check');
      return false;
    }

    // Normalize table name (trim whitespace)
    tableName = tableName.trim();

    // 1. Check environment variable override first
    const envOverride = this.checkEnvOverride(tableName, database);
    if (envOverride !== undefined) {
      this.logger.debug(`Using env override for ${tableName} on ${database}: ${envOverride}`);
      return envOverride;
    }

    // 2. Get config for database
    const config = TABLE_WRITE_PERMISSIONS[database];
    if (!config) {
      this.logger.error(`No configuration found for database: ${database}`);
      return false;
    }

    // 3. Check if table is in allowed list
    // Allowlist has priority - explicitly allowed tables override blocked patterns
    const inAllowlist = this.isTableAllowed(tableName, config.allowedTables);

    if (inAllowlist) {
      this.logger.debug(`Write operation allowed: ${operation} on ${tableName} (${database})`);
      return true;
    }

    // 4. Not in allowlist - check if table matches blocked patterns
    if (this.matchesBlockedPattern(tableName, config.blockedPatterns)) {
      this.logger.debug(`Table ${tableName} matches blocked pattern for ${database}`);
      return false;
    }

    // Not in allowlist and doesn't match blocked patterns
    // For TESTE environment, allow all tables (wildcard in allowlist)
    // For PROD/TREINA, deny unlisted tables
    this.logger.debug(`Table ${tableName} not in allowlist for ${database}`);
    return false; // Default deny for unlisted tables
  }

  /**
   * Check if operation requires boss approval
   *
   * @param tableName - Name of the target table
   * @param database - Target database
   * @returns true if x-boss-approval header is required
   *
   * @example
   * if (service.requiresBossApproval('AD_RDOAPONTAMENTOS', 'PROD')) {
   *   // Must validate x-boss-approval header
   * }
   */
  requiresBossApproval(tableName: string, database: string): boolean {
    const config = TABLE_WRITE_PERMISSIONS[database as DatabaseKey];
    if (!config) {
      return false;
    }

    return config.requireBossApproval;
  }

  /**
   * Get list of tables allowed for write operations in a database
   *
   * @param database - Target database
   * @returns Array of allowed table names/patterns
   *
   * @example
   * const tables = service.getAllowedTables('PROD');
   * // Returns: ['AD_RDOAPONTAMENTOS', 'AD_RDOAPONDETALHES', ...]
   */
  getAllowedTables(database: string): string[] {
    const config = TABLE_WRITE_PERMISSIONS[database as DatabaseKey];
    return config?.allowedTables ?? [];
  }

  /**
   * Get configuration for a specific database
   *
   * @param database - Target database
   * @returns Configuration object for the database
   */
  getConfiguration(database: string): TablePermissionConfig | undefined {
    return TABLE_WRITE_PERMISSIONS[database as DatabaseKey];
  }

  /**
   * Check if table name matches allowed pattern
   *
   * Supports:
   * - Exact match: 'AD_RDOAPONTAMENTOS'
   * - Wildcard: '*' (all tables)
   * - Pattern: 'AD_*', 'TSI*'
   *
   * @param tableName - Name to check
   * @param allowedList - List of allowed patterns
   * @returns true if table matches any allowed pattern
   */
  private isTableAllowed(tableName: string, allowedList: string[]): boolean {
    // If wildcard is present, all tables are allowed
    if (allowedList.includes('*')) {
      return true;
    }

    // Check each pattern in the allowlist
    return allowedList.some((pattern) => {
      return this.matchesPattern(tableName, pattern);
    });
  }

  /**
   * Check if table name matches any blocked pattern
   *
   * Blocked patterns override allowlist - if a table matches any blocked pattern,
   * it will be rejected even if in allowlist.
   *
   * @param tableName - Name to check
   * @param blockedPatterns - List of blocked patterns
   * @returns true if table matches any blocked pattern
   */
  private matchesBlockedPattern(tableName: string, blockedPatterns: string[]): boolean {
    // Special case: '*' blocks everything
    if (blockedPatterns.includes('*')) {
      return true;
    }

    // Check each pattern in the blocklist
    return blockedPatterns.some((pattern) => {
      return this.matchesPattern(tableName, pattern);
    });
  }

  /**
   * Check if a table name matches a pattern (with wildcard support)
   *
   * @param tableName - Table name to match
   * @param pattern - Pattern to match against (supports * wildcard)
   * @returns true if table matches pattern
   *
   * @example
   * matchesPattern('AD_RDOAPONTAMENTOS', 'AD_*')      // true
   * matchesPattern('TSIUSU', 'TSI*')                   // true
   * matchesPattern('AD_RDOAPONTAMENTOS', 'AD_RDO*')    // true
   * matchesPattern('TGFVEI', 'AD_*')                   // false
   */
  private matchesPattern(tableName: string, pattern: string): boolean {
    if (!tableName || !pattern) {
      return false;
    }

    // Normalize to uppercase for case-insensitive comparison
    const normalizedTable = tableName.toUpperCase().trim();
    const normalizedPattern = pattern.toUpperCase().trim();

    // Exact match
    if (normalizedPattern === normalizedTable) {
      return true;
    }

    // Wildcard pattern matching
    if (normalizedPattern.includes('*')) {
      // Convert wildcard pattern to regex
      // 'AD_*' becomes /^AD_.*/i
      // '*' becomes /^.*/i
      const regexPattern = normalizedPattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars except *
        .replace(/\*/g, '.*'); // Replace * with .*

      const regex = new RegExp(`^${regexPattern}$`, 'i');
      return regex.test(normalizedTable);
    }

    return false;
  }

  /**
   * Check for environment variable override
   *
   * Environment variables take precedence over config file.
   * Supports:
   * - WRITE_ALLOWED_{DATABASE}_{TABLE}=true|false
   * - WRITE_ALLOWED_TABLES_{DATABASE}=TABLE1,TABLE2,TABLE3
   *
   * @param tableName - Table to check
   * @param database - Target database
   * @returns true/false if override exists, undefined if no override
   *
   * @example
   * // Specific table override
   * WRITE_ALLOWED_PROD_AD_RDOAPONTAMENTOS=true
   *
   * // List override for entire database
   * WRITE_ALLOWED_TABLES_PROD=AD_RDOAPONTAMENTOS,AD_RDOAPONDETALHES
   */
  private checkEnvOverride(tableName: string, database: DatabaseKey): boolean | undefined {
    // 1. Check specific table override: WRITE_ALLOWED_{DATABASE}_{TABLE}
    const specificKey = `WRITE_ALLOWED_${database}_${tableName}`;
    const specificValue = this.configService.get<string>(specificKey);

    if (specificValue !== undefined) {
      const result = this.parseBooleanValue(specificValue);
      if (result !== undefined) {
        return result;
      }
    }

    // 2. Check list override: WRITE_ALLOWED_TABLES_{DATABASE}
    const listKey = `WRITE_ALLOWED_TABLES_${database}`;
    const listValue = this.configService.get<string>(listKey);

    if (listValue !== undefined && listValue.trim() !== '') {
      // Parse comma-separated list of tables
      const tables = listValue.split(',').map((t) => t.trim().toUpperCase());

      // Check if table is in the list
      if (this.isTableAllowed(tableName, tables)) {
        return true;
      }
      // If table is not in the override list, deny it
      return false;
    }

    // No override found
    return undefined;
  }

  /**
   * Parse boolean value from string
   *
   * @param value - String value to parse
   * @returns boolean if valid, undefined if not recognized
   */
  private parseBooleanValue(value: string): boolean | undefined {
    if (!value) return undefined;

    const normalized = value.toLowerCase().trim();

    if (normalized === 'true' || normalized === '1' || normalized === 's' || normalized === 'yes') {
      return true;
    }

    if (normalized === 'false' || normalized === '0' || normalized === 'n' || normalized === 'no') {
      return false;
    }

    return undefined;
  }
}
