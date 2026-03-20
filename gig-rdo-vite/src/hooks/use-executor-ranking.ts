import { useQuery } from '@tanstack/react-query';
import { fetchExecutorRanking } from '@/api/executor-ranking';

interface UseExecutorRankingParams {
  startDate?: string;
  endDate?: string;
}

export function useExecutorRanking(params?: UseExecutorRankingParams) {
  return useQuery({
    queryKey: ['executor', 'ranking', params?.startDate, params?.endDate],
    queryFn: () => fetchExecutorRanking(params),
    staleTime: 1000 * 60 * 5,
  });
}
