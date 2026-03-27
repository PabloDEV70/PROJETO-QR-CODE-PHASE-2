import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  actualMode: 'light' | 'dark';
}

interface ThemeActions {
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  initialize: () => void;
}

export function createThemeStore() {
  const STORAGE_KEY = 'theme_mode';

  return create<ThemeState & ThemeActions>((set, get) => ({
    mode: 'system',
    actualMode: 'light',

    setMode: (mode) => {
      const getActualMode = (m: ThemeMode): 'light' | 'dark' => {
        if (m === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return m;
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, mode);
      }

      set({
        mode,
        actualMode: getActualMode(mode),
      });
    },

    toggleMode: () => {
      const { mode } = get();
      const newMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
      get().setMode(newMode);
    },

    initialize: () => {
      if (typeof window === 'undefined') return;

      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      const mode = stored || 'system';

      const getActualMode = (m: ThemeMode): 'light' | 'dark' => {
        if (m === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return m;
      };

      set({
        mode,
        actualMode: getActualMode(mode),
      });

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (get().mode === 'system') {
          set({ actualMode: getActualMode('system') });
        }
      });
    },
  }));
}

export type ThemeStore = ReturnType<typeof createThemeStore>;
export type { ThemeActions };
