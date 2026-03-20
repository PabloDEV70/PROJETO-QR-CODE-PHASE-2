import { apiClient } from '@/api/client';
import { useDeviceStore } from '@/stores/device-store';
import type { ColaboradorGrid } from '@/types/funcionario-types';

export async function fetchColaboradores(showAfastados = false): Promise<ColaboradorGrid[]> {
  const params: Record<string, string> = { limit: '500' };
  if (!showAfastados) params.situacao = '1';
  const { data } = await apiClient.get<{ data: ColaboradorGrid[] }>(
    '/funcionarios/listar',
    { params },
  );
  return data.data;
}

export function getFotoUrl(codparc: number): string {
  const base = apiClient.defaults.baseURL;
  const { token } = useDeviceStore.getState();
  return `${base}/funcionarios/${codparc}/foto?token=${token}`;
}
