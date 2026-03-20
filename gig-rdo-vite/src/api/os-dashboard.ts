import { apiClient } from '@/api/client';
import type { OsDashboardKpis } from '@/types/os-dashboard-types';

export async function fetchOsDashboard(): Promise<OsDashboardKpis> {
  const { data } = await apiClient.get<OsDashboardKpis>('/os/dashboard');
  return data;
}
