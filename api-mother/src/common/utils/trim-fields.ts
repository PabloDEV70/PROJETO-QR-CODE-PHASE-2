// Utilitário global para trim em todos os campos string de um objeto
export function trimFields<T extends Record<string, unknown>>(row: T): T {
  if (!row || typeof row !== 'object') return row;
  const trimmed: Record<string, unknown> = {};
  for (const key in row) {
    if (typeof row[key] === 'string') {
      trimmed[key] = (row[key] as string).trim();
    } else {
      trimmed[key] = row[key];
    }
  }
  return trimmed as T;
}
