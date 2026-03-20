import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from './auth-store';

export function useImpersonationSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const impersonating = useAuthStore((s) => s.impersonating);
  const startImpersonating = useAuthStore((s) => s.startImpersonating);
  const stopImpersonating = useAuthStore((s) => s.stopImpersonating);

  const codparcParam = searchParams.get('as_codparc');
  const nomeParam = searchParams.get('as_nome');

  useEffect(() => {
    if (codparcParam && nomeParam && !impersonating) {
      startImpersonating(parseInt(codparcParam, 10), nomeParam);
    }
  }, [codparcParam, nomeParam, impersonating, startImpersonating]);

  const setImpersonating = useCallback((codparc: number | null, nome: string | null) => {
    if (codparc && nome) {
      setSearchParams({ as_codparc: String(codparc), as_nome: nome });
      startImpersonating(codparc, nome);
    } else {
      setSearchParams({});
      stopImpersonating();
    }
  }, [setSearchParams, startImpersonating, stopImpersonating]);

  const clearImpersonating = useCallback(() => {
    setSearchParams({});
    stopImpersonating();
  }, [setSearchParams, stopImpersonating]);

  return {
    impersonating,
    isImpersonating: impersonating !== null,
    setImpersonating,
    clearImpersonating,
  };
}
