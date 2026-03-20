export interface ParsedFilter {
  mode: 'include' | 'exclude';
  values: number[];
}

export function parseIncludeExclude(raw: string): ParsedFilter {
  const isExclude = raw.startsWith('!');
  const cleanStr = isExclude ? raw.slice(1) : raw;
  const values = cleanStr
    .split(',')
    .map((v) => parseInt(v.trim(), 10))
    .filter((n) => !isNaN(n));
  return {
    mode: isExclude ? 'exclude' : 'include',
    values,
  };
}

export function buildFilterSql(
  column: string,
  filter: ParsedFilter,
): string {
  if (filter.values.length === 0) return '';
  const list = filter.values.join(', ');
  if (filter.values.length === 1) {
    return filter.mode === 'include'
      ? `${column} = ${filter.values[0]}`
      : `${column} <> ${filter.values[0]}`;
  }
  return filter.mode === 'include'
    ? `${column} IN (${list})`
    : `${column} NOT IN (${list})`;
}
