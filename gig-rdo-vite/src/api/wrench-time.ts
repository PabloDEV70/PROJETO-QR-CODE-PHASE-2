import { apiClient } from '@/api/client';
import type { MotivoPorColab } from '@/types/wrench-time-types';
import type { RdoDetalhesParams } from '@/types/rdo-types';

export async function getMotivosPorColaborador(
  params: Omit<RdoDetalhesParams, 'page' | 'limit'> = {},
): Promise<MotivoPorColab[]> {
  const { data } = await apiClient.get<{ data: MotivoPorColab[] }>(
    '/rdo/analytics/motivos/colaborador',
    { params },
  );
  return data.data;
}
