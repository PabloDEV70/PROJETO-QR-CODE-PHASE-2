import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, DatabaseEnv } from '@/types/auth-types';

interface AuthState {
  user: AuthUser | null;
  database: DatabaseEnv;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  setDatabase: (db: DatabaseEnv) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      database: 'PROD',
      isAuthenticated: false,
      isAdmin: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, isAdmin: false }),
      setDatabase: (database) => set({ database }),
    }),
    {
      name: 'ti-admin-auth',
      partialize: (state) => ({
        user: state.user,
        database: state.database,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
