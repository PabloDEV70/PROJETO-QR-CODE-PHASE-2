import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from './auth-store';

export function useUrlImpersonation() {
  const [searchParams] = useSearchParams();
  const impersonating = useAuthStore((s) => s.impersonating);
  const startImpersonating = useAuthStore((s) => s.startImpersonating);
  const stopImpersonating = useAuthStore((s) => s.stopImpersonating);

  const asParc = searchParams.get('asParc');

  useEffect(() => {
    if (asParc && !impersonating) {
      startImpersonating(parseInt(asParc, 10), 'Usuário');
    }
  }, [asParc, impersonating, startImpersonating]);

  useEffect(() => {
    if (!asParc && impersonating) {
      stopImpersonating();
    }
  }, [asParc, impersonating, stopImpersonating]);

  return {
    impersonating,
    isImpersonating: impersonating !== null,
  };
}
