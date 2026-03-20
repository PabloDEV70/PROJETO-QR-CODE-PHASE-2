import { useAuthStore } from '@/stores/auth-store';

export function useEffectiveCodparc() {
  const realCodparc = useAuthStore((s) => s.user?.codparc);
  const impersonating = useAuthStore((s) => s.impersonating);
  return impersonating?.codparc ?? realCodparc;
}

export function useIsImpersonating() {
  return useAuthStore((s) => s.impersonating !== null);
}
