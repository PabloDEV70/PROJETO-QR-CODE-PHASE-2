import { getApiBaseUrl } from '@/api/client';
import { useAuthStore } from '@/stores/auth-store';

export function getFuncionarioFotoUrl(codparc: number): string {
  const baseUrl = getApiBaseUrl();
  const token = useAuthStore.getState().user?.token;
  const tokenParam = token ? `?token=${token}` : '';
  return `${baseUrl}/funcionarios/${codparc}/foto${tokenParam}`;
}

export function getFuncionarioFotoByCodfuncUrl(
  codemp: number,
  codfunc: number,
): string {
  const baseUrl = getApiBaseUrl();
  const token = useAuthStore.getState().user?.token;
  const tokenParam = token ? `?token=${token}` : '';
  return `${baseUrl}/funcionarios/foto/${codemp}/${codfunc}${tokenParam}`;
}
