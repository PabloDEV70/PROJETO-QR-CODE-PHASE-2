const STORAGE_KEY = 'rdo-filters';

/** Filter keys persisted to localStorage */
const PERSISTED_KEYS = [
  'dataInicio', 'dataFim', 'codparc', 'coddep', 'codfuncao',
  'rdomotivocod', 'density', 'limit',
] as const;

type FilterRecord = Record<string, string>;

export function saveFiltersToStorage(params: URLSearchParams): void {
  const saved: FilterRecord = {};
  for (const key of PERSISTED_KEYS) {
    const val = params.get(key);
    if (val) saved[key] = val;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch { /* quota exceeded — ignore */ }
}

export function loadFiltersFromStorage(): FilterRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FilterRecord;
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearFiltersFromStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
