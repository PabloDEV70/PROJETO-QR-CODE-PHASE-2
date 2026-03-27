import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, DatabaseEnv } from '@shared/ui-lib';

/** Admin groups by CODGRUPO: DIRETORIA, QUALIDADE, GERENCIA, TI, PCM */
const ADMIN_CODGRUPOS = [3, 9, 11, 13, 20];

export function isUserAdmin(user: AuthUser | null): boolean {
  if (!user?.codgrupo) return false;
  return ADMIN_CODGRUPOS.includes(user.codgrupo);
}

export interface Impersonating {
  codparc: number;
  nome: string;
}

interface AuthState {
  user: AuthUser | null;
  database: DatabaseEnv;
  isAuthenticated: boolean;
  isAdmin: boolean;
  impersonating: Impersonating | null;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  setDatabase: (db: DatabaseEnv) => void;
  startImpersonating: (codparc: number, nome: string) => void;
  stopImpersonating: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      database: 'PROD',
      isAuthenticated: false,
      isAdmin: false,
      impersonating: null,
      setUser: (user) =>
        set({ user, isAuthenticated: true, isAdmin: isUserAdmin(user) }),
      logout: () =>
        set({ user: null, isAuthenticated: false, isAdmin: false, impersonating: null }),
      setDatabase: (database) => set({ database }),
      startImpersonating: (codparc, nome) =>
        set({ impersonating: { codparc, nome } }),
      stopImpersonating: () =>
        set({ impersonating: null }),
    }),
    {
      name: 'pwa-apontamentos-auth',
      partialize: (state) => ({
        user: state.user,
        database: state.database,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        // impersonating NOT persisted — intentional (session-only)
      }),
    },
  ),
);
