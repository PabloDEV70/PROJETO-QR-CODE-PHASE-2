import { useQuery } from '@tanstack/react-query';
import { fetchOsAbertas } from '@/api/rdo';

export function useMinhasOs(codparc: number, enabled = true) {
  return useQuery({
    queryKey: ['os-abertas', codparc],
    queryFn: () => fetchOsAbertas(codparc),
    staleTime: 2 * 60_000,
    enabled,
    retry: false,
  });
}
