import { getApiBaseUrl } from '@/api/client';
import { useAuthStore } from '@/stores/auth-store';

function getToken(): string {
  return useAuthStore.getState().user?.token ?? '';
}

export function getFuncionarioFotoUrl(codparc: number): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/funcionarios/${codparc}/foto?token=${getToken()}`;
}

export function getFuncionarioFotoByCodfuncUrl(
  codemp: number,
  codfunc: number,
): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/funcionarios/foto/${codemp}/${codfunc}?token=${getToken()}`;
}
