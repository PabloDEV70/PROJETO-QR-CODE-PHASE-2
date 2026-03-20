import { getApiBaseUrl } from '@/api/client';
import { useAuthStore } from '@/stores/auth-store';

function withToken(url: string): string {
  const token = useAuthStore.getState().user?.token;
  return token ? `${url}?token=${token}` : url;
}

export function getFuncionarioFotoUrl(codparc: number): string {
  return withToken(`${getApiBaseUrl()}/funcionarios/${codparc}/foto`);
}

export function getFuncionarioFotoByCodfuncUrl(
  codemp: number,
  codfunc: number,
): string {
  return withToken(`${getApiBaseUrl()}/funcionarios/foto/${codemp}/${codfunc}`);
}
