import { useEffect } from 'react';
import { getMe } from '@/api/auth';
import { useAuthStore } from '@/stores/auth-store';

/**
 * On app startup, re-fetch /auth/me to keep user profile data fresh
 * (codgrupo, nomecompleto, etc.) without requiring re-login.
 */
export function useRefreshMe() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!user?.token) return;

    getMe(user.token)
      .then((me) => {
        const updated = {
          ...user,
          codusu: me.codusu,
          nome: me.nome,
          nomecompleto: me.nomecompleto ?? undefined,
          codparc: me.codparc ?? user.codparc,
          codgrupo: me.codgrupo ?? undefined,
          codemp: me.codemp ?? undefined,
          codfunc: me.codfunc ?? undefined,
          pertencedp: me.pertencedp ?? undefined,
          nomegrupo: me.nomegrupo ?? undefined,
        };
        setUser(updated);
      })
      .catch(() => { /* silent — auth guard will handle 401 */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount
}
