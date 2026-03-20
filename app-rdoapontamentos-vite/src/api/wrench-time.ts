import { apiClient } from './client';
import type { MotivoPorColab } from '../types/wrench-time-types';

export async function getMotivosPorColaborador(
  params: Record<string, string | number> = {},
): Promise<MotivoPorColab[]> {
  const { data } = await apiClient.get<{ data: MotivoPorColab[] }>(
    '/rdo/analytics/motivos/colaborador', { params },
  );
  return data.data;
}
