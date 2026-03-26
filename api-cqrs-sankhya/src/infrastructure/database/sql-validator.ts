const FORBIDDEN = /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|MERGE|EXEC|EXECUTE|GRANT|REVOKE|DENY|OPENROWSET|OPENQUERY|BULK\s+INSERT|SHUTDOWN|RECONFIGURE|SP_|XP_)/i;

const ALLOWED = /^\s*(SELECT|WITH)\b/i;

export function validateReadOnly(sql: string): void {
  const clean = sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, '').trim();

  if (!ALLOWED.test(clean)) {
    throw new Error(`SECURITY: Only SELECT/WITH queries allowed. Got: "${clean.substring(0, 50)}..."`);
  }

  if (FORBIDDEN.test(clean)) {
    throw new Error(`SECURITY: Forbidden SQL operation detected in: "${clean.substring(0, 50)}..."`);
  }

  if (clean.includes(';')) {
    throw new Error('SECURITY: Multiple statements not allowed.');
  }
}
