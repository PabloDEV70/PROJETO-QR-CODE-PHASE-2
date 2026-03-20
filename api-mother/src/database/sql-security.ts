import { ForbiddenException } from '@nestjs/common';

const DESTRUCTIVE_KEYWORDS = [
  'DROP',
  'TRUNCATE',
  'DELETE',
  'UPDATE',
  'INSERT',
  'ALTER',
  'CREATE',
  'EXEC',
  'EXECUTE',
  'GRANT',
  'REVOKE',
  'DENY',
  'BACKUP',
  'RESTORE',
  'SHUTDOWN',
  'KILL',
  'DBCC',
  'sp_',
  'xp_',
];

const SAFE_SELECT_PATTERN = /^\s*SELECT\s/i;

export function validateSqlQuery(query: string): void {
  const normalizedQuery = query.toUpperCase().trim();

  // Verifica se é um SELECT
  if (!SAFE_SELECT_PATTERN.test(query)) {
    throw new ForbiddenException({
      message: 'Apenas queries SELECT são permitidas',
      code: 'SQL_NOT_SELECT',
    });
  }

  // Verifica keywords destrutivas (mesmo dentro de subqueries)
  for (const keyword of DESTRUCTIVE_KEYWORDS) {
    const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
    if (pattern.test(normalizedQuery)) {
      throw new ForbiddenException({
        message: `Operação SQL bloqueada: ${keyword} não é permitido`,
        code: 'SQL_DESTRUCTIVE_BLOCKED',
      });
    }
  }

  // Bloqueia múltiplos statements (;)
  const withoutStrings = query.replace(/'[^']*'/g, '');
  if (withoutStrings.includes(';')) {
    throw new ForbiddenException({
      message: 'Múltiplos statements SQL não são permitidos',
      code: 'SQL_MULTIPLE_STATEMENTS_BLOCKED',
    });
  }
}

export function isQuerySafe(query: string): boolean {
  try {
    validateSqlQuery(query);
    return true;
  } catch {
    return false;
  }
}
