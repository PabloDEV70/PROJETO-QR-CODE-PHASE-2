import { getApiBaseUrl } from '@/api/client';
import { useAuthStore } from '@/stores/auth-store';

/** Append token as query param so <img src> sends auth */
function withToken(url: string): string {
  const token = useAuthStore.getState().user?.token;
  if (!token) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}token=${token}`;
}

export function getFuncionarioFotoUrl(codparc: number): string {
  const baseUrl = getApiBaseUrl();
  return withToken(`${baseUrl}/funcionarios/${codparc}/foto`);
}

export function getFuncionarioFotoByCodfuncUrl(
  codemp: number,
  codfunc: number,
): string {
  const baseUrl = getApiBaseUrl();
  return withToken(`${baseUrl}/funcionarios/foto/${codemp}/${codfunc}`);
}
