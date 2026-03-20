import { Alert, Grid, Typography } from '@mui/material';
import { useOsDashboard } from '@/hooks/use-os-dashboard';
import { OsKpiCards } from '@/components/os/os-kpi-cards';
import { OsStatusDonut } from '@/components/os/os-status-donut';
import { OsTypeBarChart } from '@/components/os/os-type-bar-chart';
import { OsVehicleRanking } from '@/components/os/os-vehicle-ranking';

export function OsDashboardPage() {
  const { data, isLoading, error } = useOsDashboard();

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error instanceof Error ? error.message : 'Erro ao carregar dashboard'}
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          Dashboard de Manutencao
        </Typography>
        <OsKpiCards data={data} isLoading={isLoading} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <OsStatusDonut statusDistribution={data?.statusDistribution} isLoading={isLoading} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <OsTypeBarChart typeDistribution={data?.typeDistribution} isLoading={isLoading} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <OsVehicleRanking mtbfByVehicle={data?.mtbfByVehicle} isLoading={isLoading} />
      </Grid>
    </Grid>
  );
}
