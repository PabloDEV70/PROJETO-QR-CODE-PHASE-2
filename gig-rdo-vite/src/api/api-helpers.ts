/** Unwrap nested { data: { data: ... } } envelope from API Mother responses */
export function unwrap(data: unknown): unknown {
  let d = data;
  if (d && typeof d === 'object' && 'data' in d) d = (d as Record<string, unknown>).data;
  if (d && typeof d === 'object' && 'data' in d) d = (d as Record<string, unknown>).data;
  return d;
}

/** Unwrap /database/* endpoints that return { data: { sucesso, dados, metadata } } */
export function unwrapDb(data: unknown): unknown {
  const d = unwrap(data);
  if (d && typeof d === 'object' && 'dados' in d)
    return (d as Record<string, unknown>).dados;
  return d;
}

export function esc(val: string): string {
  return val.replace(/'/g, "''");
}
