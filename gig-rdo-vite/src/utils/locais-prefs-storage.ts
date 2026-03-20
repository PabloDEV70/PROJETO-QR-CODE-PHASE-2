const STORAGE_KEY = 'locais-prefs';

export interface LocaisPrefs {
  view?: string;
  sort?: string;
  hideDesativ?: string;
}

export function saveLocaisPrefs(prefs: LocaisPrefs): void {
  try {
    const current = loadLocaisPrefs();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch { /* quota exceeded — ignore */ }
}

export function loadLocaisPrefs(): LocaisPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as LocaisPrefs;
  } catch {
    return {};
  }
}
