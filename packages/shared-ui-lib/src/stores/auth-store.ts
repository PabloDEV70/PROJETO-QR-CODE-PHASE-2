import { create } from 'zustand';
import type { User, Token } from '../types';

interface AuthStoreOptions {
  storageKey?: string;
}

export interface AuthData {
  user: User | null;
  token: Token | null;
  isAuthenticated: boolean;
  database: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: Token | null) => void;
  setDatabase: (database: string | null) => void;
  login: (user: User, token: Token) => void;
  logout: () => void;
  initialize: () => void;
}

export function createAuthStore(options: AuthStoreOptions = {}) {
  const { storageKey = 'auth_token' } = options;

  return create<AuthData & AuthActions>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    database: null,

    setUser: (user) => set({ user }),

    setToken: (token) => {
      if (token && typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(token));
      } else if (!token && typeof window !== 'undefined') {
        localStorage.removeItem(storageKey);
      }
      set({ token, isAuthenticated: !!token });
    },

    setDatabase: (database) => {
      if (database && typeof window !== 'undefined') {
        localStorage.setItem(`${storageKey}_db`, database);
      }
      set({ database });
    },

    login: (user, token) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(token));
      }
      set({ user, token, isAuthenticated: true });
    },

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}_db`);
      }
      set({ user: null, token: null, isAuthenticated: false, database: null });
    },

    initialize: () => {
      if (typeof window === 'undefined') return;

      try {
        const storedToken = localStorage.getItem(storageKey);
        const storedDb = localStorage.getItem(`${storageKey}_db`);

        if (storedToken) {
          const token = JSON.parse(storedToken) as Token;
          set({ token, isAuthenticated: true, database: storedDb });
        }
      } catch {
        set({ token: null, isAuthenticated: false });
      }
    },
  }));
}

export type AuthStore = ReturnType<typeof createAuthStore>;
export type { AuthActions };
