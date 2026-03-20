/**
 * Escapes a string for safe use in SQL Server string literals.
 * Doubles single quotes to prevent SQL injection.
 * Removes comment markers and statement terminators.
 */
export function escapeSqlString(value: string): string {
  return value
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

/**
 * Wraps a sanitized string for use in LIKE clauses.
 * Example: escapeSqlLike('test') → '%test%'
 */
export function escapeSqlLike(value: string): string {
  const safe = escapeSqlString(value);
  return `'%${safe}%'`;
}

/**
 * Validates and escapes a date string (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS).
 * Throws if the value doesn't match expected date formats.
 */
export function escapeSqlDate(value: string): string {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/.test(trimmed)) {
    throw new Error(`Invalid date format: ${trimmed}`);
  }
  return escapeSqlString(trimmed);
}

/**
 * Validates a SQL identifier (table/column name).
 * Only allows alphanumeric chars and underscores.
 */
export function escapeSqlIdentifier(value: string): string {
  const trimmed = value.trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed)) {
    throw new Error(`Invalid SQL identifier: ${trimmed}`);
  }
  return trimmed;
}
