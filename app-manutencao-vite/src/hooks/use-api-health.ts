import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getApiBaseUrl } from '@/api/client';

export interface DeepHealthData {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  nodeVersion: string;
  platform: string;
  pid: number;
  memory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  database: string;
  api: {
    name: string;
    version: string;
    branch: string;
    commitHash: string;
    commitShort: string;
    buildDate: string;
    environment: string;
    port: number;
  };
  apiMother: {
    status: string;
    url: string;
    version: Record<string, unknown>;
    health: Record<string, unknown>;
  };
}

/**
 * Pings /health/deep every 30s using raw axios (no auth interceptor).
 * Returns full system health including API Mother status.
 */
export function useApiHealth() {
  const { data, isError } = useQuery({
    queryKey: ['api-health-deep'],
    queryFn: async () => {
      const baseUrl = getApiBaseUrl();
      const res = await axios.get<DeepHealthData>(`${baseUrl}/health/deep`, {
        timeout: 10_000,
        validateStatus: (s) => s === 200 || s === 503,
      });
      return res.data;
    },
    refetchInterval: 30_000,
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 20_000,
    meta: { skipGlobalError: true },
  });

  return {
    isOnline: !isError && !!data,
    data: data ?? null,
  };
}
