import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, DatabaseEnv } from '@/types/auth-types';

const ADMIN_GROUPS = ['TI', 'TECNOLOGIA DA INFORMACAO', 'INFORMATICA'];

export function isUserAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.nomegrupo) {
    const upper = user.nomegrupo.toUpperCase();
    if (ADMIN_GROUPS.some((g) => upper.includes(g))) return true;
  }
  return false;
}

interface ImpersonationTarget {
  codparc: number;
  nome: string;
}

interface AuthState {
  user: AuthUser | null;
  database: DatabaseEnv;
  isAuthenticated: boolean;
  isAdmin: boolean;
  impersonating: ImpersonationTarget | null;
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
      name: 'apontamentos-auth',
      partialize: (state) => ({
        user: state.user,
        database: state.database,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    },
  ),
);
