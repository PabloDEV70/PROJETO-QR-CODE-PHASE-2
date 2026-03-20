import { apiClient } from '@/api/client';
import type { ExecutorRankingResponse } from '@/types/executor-ranking-types';

interface FetchExecutorRankingParams {
  startDate?: string;
  endDate?: string;
}

export async function fetchExecutorRanking(
  params?: FetchExecutorRankingParams,
): Promise<ExecutorRankingResponse> {
  const { data } = await apiClient.get<ExecutorRankingResponse>(
    '/os/executors/ranking',
    { params },
  );
  return data;
}
