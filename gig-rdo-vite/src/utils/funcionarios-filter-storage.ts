const STORAGE_KEY = 'funcionarios-filters';

const PERSISTED_KEYS = [
  'situacao', 'codemp', 'coddep', 'codcargo', 'codfuncao',
  'termo', 'tab', 'orderBy', 'orderDir', 'dataInicio', 'dataFim',
] as const;

type FilterRecord = Record<string, string>;

export function saveFuncionariosFilters(params: URLSearchParams): void {
  const saved: FilterRecord = {};
  for (const key of PERSISTED_KEYS) {
    const val = params.get(key);
    if (val) saved[key] = val;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch { /* quota exceeded */ }
}

export function loadFuncionariosFilters(): FilterRecord | null {
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

export function clearFuncionariosFilters(): void {
  localStorage.removeItem(STORAGE_KEY);
}
