import { apiClient } from '@/api/client';
import type { HorasEsperadasResponse, HorasEsperadasParams } from '@/types/horas-esperadas-types';

export async function getHorasEsperadas(
  params: HorasEsperadasParams,
): Promise<HorasEsperadasResponse> {
  const { data } = await apiClient.get<HorasEsperadasResponse>(
    '/rdo/analytics/horas-esperadas',
    { params },
  );
  return data;
}
