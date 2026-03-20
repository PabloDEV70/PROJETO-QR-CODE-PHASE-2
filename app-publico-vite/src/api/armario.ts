import axios from 'axios';
import { publicApi } from './client';
import type { ArmarioPublico } from '@/types/armario-types';

export async function fetchArmarioPublico(codarmario: number): Promise<ArmarioPublico | null> {
  try {
    const { data } = await publicApi.get<ArmarioPublico>(`/armarios/publico/${codarmario}`);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}
