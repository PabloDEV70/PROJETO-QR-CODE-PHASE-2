import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Bidirectional sync: URL search params ↔ Zustand impersonation state.
 * URL is the source of truth.
 *
 * Params: ?viewAsCodParc=123&viewAsNome=FULANO
 *
 * Must be rendered inside a route (needs useSearchParams).
 */
export function useImpersonationSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const impersonating = useAuthStore((s) => s.impersonating);
  const startImpersonating = useAuthStore((s) => s.startImpersonating);
  const stopImpersonating = useAuthStore((s) => s.stopImpersonating);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const urlCodParc = searchParams.get('viewAsCodParc');
  const urlNome = searchParams.get('viewAsNome');

  // URL → Store: sync on mount and when URL changes
  useEffect(() => {
    if (!isAdmin) {
      // Non-admin: strip params if present, clear store
      if (urlCodParc) {
        searchParams.delete('viewAsCodParc');
        searchParams.delete('viewAsNome');
        setSearchParams(searchParams, { replace: true });
      }
      if (impersonating) stopImpersonating();
      return;
    }

    const codparc = urlCodParc ? Number(urlCodParc) : null;
    const nome = urlNome ?? '';

    if (codparc && codparc > 0) {
      // URL has impersonation params → sync to store
      if (impersonating?.codparc !== codparc) {
        startImpersonating(codparc, nome);
      }
    } else {
      // URL has no params → clear store
      if (impersonating) stopImpersonating();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCodParc, urlNome, isAdmin]);
}

/**
 * Navigate helpers for setting/clearing impersonation via URL.
 * Returns functions that manipulate search params.
 */
export function useImpersonationNav() {
  const [searchParams, setSearchParams] = useSearchParams();

  const startViewAs = (codparc: number, nome: string) => {
    searchParams.set('viewAsCodParc', String(codparc));
    searchParams.set('viewAsNome', nome);
    setSearchParams(searchParams, { replace: true });
  };

  const stopViewAs = () => {
    searchParams.delete('viewAsCodParc');
    searchParams.delete('viewAsNome');
    setSearchParams(searchParams, { replace: true });
  };

  return { startViewAs, stopViewAs };
}
