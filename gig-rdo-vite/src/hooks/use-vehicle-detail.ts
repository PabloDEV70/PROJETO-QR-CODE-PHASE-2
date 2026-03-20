import { useQuery } from '@tanstack/react-query';
import { fetchVehicleDetail } from '@/api/vehicle-detail';

export function useVehicleDetail(codveiculo: number | null) {
  return useQuery({
    queryKey: ['vehicle', 'detail', codveiculo],
    queryFn: () => fetchVehicleDetail(codveiculo!),
    enabled: codveiculo !== null,
    staleTime: 5 * 60 * 1000,
  });
}
