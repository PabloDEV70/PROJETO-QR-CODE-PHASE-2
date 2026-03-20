import { apiClient } from '@/api/client';
import type { QuadroResponse } from '@/types/preventiva-types';

export async function getPreventivQuadro(): Promise<QuadroResponse> {
  const { data } = await apiClient.get<QuadroResponse>('/veiculos/preventivas/quadro');
  return data;
}
