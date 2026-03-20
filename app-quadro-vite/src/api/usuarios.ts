import { apiClient, getApiBaseUrl } from '@/api/client';
import { useAuthStore } from '@/stores/auth-store';

export interface UsuarioItem {
  codusu: number;
  nomeusu: string;
  codparc: number | null;
  nomeparc?: string;
}

export async function fetchUsuarios(search = '', departamento?: string): Promise<UsuarioItem[]> {
  const { data } = await apiClient.get<UsuarioItem[]>('/usuarios/search', {
    params: { q: search, ...(departamento && { departamento }) },
  });
  return data;
}

export function getUsuarioFotoUrl(codparc: number | null): string | null {
  if (!codparc) return null;
  const baseUrl = getApiBaseUrl();
  const token = useAuthStore.getState().user?.token;
  const base = `${baseUrl}/funcionarios/${codparc}/foto`;
  return token ? `${base}?token=${token}` : base;
}
