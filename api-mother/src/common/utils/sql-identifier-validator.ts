const IDENTIFIER_REGEX = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/;

const SQL_RESERVED = new Set([
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
  'TRUNCATE', 'EXEC', 'EXECUTE', 'UNION', 'GRANT', 'REVOKE', 'DENY',
  'MERGE', 'BACKUP', 'RESTORE', 'SHUTDOWN', 'RECONFIGURE',
  'OPENROWSET', 'OPENQUERY', 'XP_', 'SP_',
]);

export function validateSqlIdentifier(name: string, type: 'table' | 'column'): string {
  if (!name || typeof name !== 'string') {
    throw new Error(`Invalid ${type} name: empty or not a string`);
  }

  const trimmed = name.trim();

  if (!IDENTIFIER_REGEX.test(trimmed)) {
    throw new Error(`Invalid ${type} name: "${trimmed}" contains illegal characters`);
  }

  if (SQL_RESERVED.has(trimmed.toUpperCase())) {
    throw new Error(`Invalid ${type} name: "${trimmed}" is a SQL reserved word`);
  }

  // Double-check: no brackets, quotes, or semicolons could have slipped through
  if (/[[\]'"`;\\]/.test(trimmed)) {
    throw new Error(`Invalid ${type} name: "${trimmed}" contains forbidden characters`);
  }

  return trimmed;
}

export function safeBracket(name: string, type: 'table' | 'column'): string {
  return `[${validateSqlIdentifier(name, type)}]`;
}
