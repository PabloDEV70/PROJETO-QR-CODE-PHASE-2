import { format } from 'sql-formatter';

export function formatSql(sql: string): string {
  try {
    return format(sql, {
      language: 'tsql',
      tabWidth: 2,
      keywordCase: 'upper',
      linesBetweenQueries: 2,
    });
  } catch {
    return sql;
  }
}
