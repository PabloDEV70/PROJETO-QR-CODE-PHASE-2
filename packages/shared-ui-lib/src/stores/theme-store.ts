import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';

export interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
}

export function createThemeStore(storageKey: string) {
  return create<ThemeState>()(
    persist(
      (set) => ({
        mode: 'light' as ThemeMode,
        toggleTheme: () =>
          set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
      }),
      { name: storageKey },
    ),
  );
}

export type ThemeStore = ReturnType<typeof createThemeStore>;
