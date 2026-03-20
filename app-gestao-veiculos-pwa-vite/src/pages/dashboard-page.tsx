import { Typography } from '@mui/material';
import { useHstVeiStats } from '@/hooks/use-hstvei-stats';
import { StatsCardGrid } from '@/components/dashboard/stats-card-grid';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

export function DashboardPage() {
  const { data: stats, isLoading } = useHstVeiStats();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Dashboard</Typography>
      <StatsCardGrid stats={stats} />
      <QuickActions />
    </>
  );
}
