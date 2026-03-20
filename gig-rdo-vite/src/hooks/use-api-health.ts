import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

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

export function useApiHealth() {
  const { data, isError } = useQuery({
    queryKey: ['api-health-deep'],
    queryFn: async () => {
      const res = await apiClient.get<DeepHealthData>('/health/deep', { timeout: 8_000 });
      return res.data;
    },
    refetchInterval: 30_000,
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 20_000,
  });

  return {
    isOnline: !isError && !!data,
    data: data ?? null,
  };
}
