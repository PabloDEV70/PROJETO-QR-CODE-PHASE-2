export function cacheKey(prefix: string, params?: Record<string, unknown>): string {
  if (!params) return prefix;
  const sorted = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return sorted ? `${prefix}:${sorted}` : prefix;
}
