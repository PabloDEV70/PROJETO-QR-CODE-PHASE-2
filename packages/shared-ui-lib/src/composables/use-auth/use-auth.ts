import { useCallback } from 'react';
import type { AuthUser, LoginResponse, MeResponse } from '../../types/auth-types';
import type { AuthState } from '../../stores/auth-store';
import type { StoreApi, UseBoundStore } from 'zustand';

interface UseAuthOptions {
  store: UseBoundStore<StoreApi<AuthState>>;
  apiClient: { get: (url: string, config?: Record<string, unknown>) => Promise<{ data: MeResponse }> };
}

export function useAuth({ store, apiClient }: UseAuthOptions) {
  const user = store((s) => s.user);
  const isAuthenticated = store((s) => s.isAuthenticated);
  const database = store((s) => s.database);
  const setUser = store((s) => s.setUser);
  const setDatabase = store((s) => s.setDatabase);
  const logoutFn = store((s) => s.logout);

  const finalizeLogin = useCallback(async (data: LoginResponse) => {
    const userObj: AuthUser = {
      token: data.token,
      refreshToken: data.refreshToken,
      type: data.type,
      username: data.username,
      codparc: data.codparc,
    };

    try {
      const { data: me } = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      Object.assign(userObj, {
        codusu: me.codusu,
        nome: me.nome,
        nomecompleto: me.nomecompleto ?? undefined,
        codparc: me.codparc ?? data.codparc,
        codgrupo: me.codgrupo ?? undefined,
        codemp: me.codemp ?? undefined,
        codfunc: me.codfunc ?? undefined,
        pertencedp: me.pertencedp ?? undefined,
        nomegrupo: me.nomegrupo ?? undefined,
      });
    } catch {
      // /auth/me failed — proceed with basic data
    }

    setUser(userObj);
  }, [setUser, apiClient]);

  const logout = useCallback(() => {
    logoutFn();
  }, [logoutFn]);

  return {
    user,
    isAuthenticated,
    database,
    setDatabase,
    finalizeLogin,
    logout,
  };
}
