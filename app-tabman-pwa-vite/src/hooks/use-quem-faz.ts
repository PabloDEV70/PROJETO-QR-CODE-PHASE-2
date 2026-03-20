import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchQuemFaz } from '@/api/rdo';
import type { QuemFazRow } from '@/types/quem-faz-types';

export function useQuemFaz(dtref?: string) {
  const hoje = format(new Date(), 'yyyy-MM-dd');
  const data = dtref || hoje;
  const isToday = data === hoje;

  return useQuery<QuemFazRow[]>({
    queryKey: ['quem-faz', data],
    queryFn: async () => {
      const raw = await fetchQuemFaz(data);
      const arr = raw?.data ?? raw;
      return Array.isArray(arr) ? arr : [];
    },
    staleTime: isToday ? 5_000 : 60_000,
    refetchInterval: isToday ? 5_000 : false,
  });
}
