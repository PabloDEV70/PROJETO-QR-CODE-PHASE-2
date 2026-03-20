import { useEffect } from 'react';
import { getMe } from '@/api/auth';
import { useAuthStore } from '@/stores/auth-store';

export function useRefreshMe() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!user?.token) return;
    getMe(user.token)
      .then((me) => {
        setUser({
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
        });
      })
      .catch(() => { /* silent */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
