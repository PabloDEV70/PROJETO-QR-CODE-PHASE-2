import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, DatabaseEnv } from '../types/auth-types';

export interface AuthState {
  user: AuthUser | null;
  database: DatabaseEnv;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  setDatabase: (db: DatabaseEnv) => void;
}

export function createAuthStore(storageKey: string) {
  return create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        database: 'PROD' as DatabaseEnv,
        isAuthenticated: false,
        setUser: (user) => set({ user, isAuthenticated: true }),
        logout: () => set({ user: null, isAuthenticated: false }),
        setDatabase: (database) => set({ database }),
      }),
      {
        name: storageKey,
        partialize: (state) => ({
          user: state.user,
          database: state.database,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
  );
}

export type AuthStore = ReturnType<typeof createAuthStore>;
