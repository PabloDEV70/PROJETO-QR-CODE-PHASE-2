import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTotpStatus,
  setupTotp,
  verifyTotpSetup,
  disableTotp,
  regenerateRecoveryCodes,
} from '@/api/totp';

export function useTotpStatus() {
  return useQuery({
    queryKey: ['totp-status'],
    queryFn: getTotpStatus,
    retry: false,
  });
}

export function useTotpSetup() {
  return useMutation({ mutationFn: setupTotp });
}

export function useTotpVerifySetup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: verifyTotpSetup,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['totp-status'] }),
  });
}

export function useTotpDisable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ password, code }: { password: string; code: string }) =>
      disableTotp(password, code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['totp-status'] }),
  });
}

export function useRegenerateRecoveryCodes() {
  return useMutation({ mutationFn: regenerateRecoveryCodes });
}
