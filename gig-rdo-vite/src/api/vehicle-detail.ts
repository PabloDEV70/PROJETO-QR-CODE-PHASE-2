import { apiClient } from '@/api/client';
import type { VehicleDetailResponse } from '@/types/vehicle-detail-types';

export async function fetchVehicleDetail(
  codveiculo: number,
): Promise<VehicleDetailResponse> {
  const { data } = await apiClient.get<VehicleDetailResponse>(
    `/os/vehicle/${codveiculo}`,
  );
  return data;
}
