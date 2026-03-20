import { Grid } from '@mui/material';
import type { PatrimonioDashboard } from '@/types/patrimonio-types';
import { PatrimonioChartValorCategoria } from './patrimonio-chart-valor-categoria';
import { PatrimonioChartMobilizacao } from './patrimonio-chart-mobilizacao';
import { PatrimonioChartIdade } from './patrimonio-chart-idade';
import { PatrimonioChartClientes } from './patrimonio-chart-clientes';
import { PatrimonioChartTimeline } from './patrimonio-chart-timeline';

interface PatrimonioDashboardChartsProps {
  dashboard: PatrimonioDashboard | undefined;
  isLoading: boolean;
}

export function PatrimonioDashboardCharts({
  dashboard,
  isLoading,
}: PatrimonioDashboardChartsProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <PatrimonioChartValorCategoria
          data={dashboard?.valorPorCategoria}
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <PatrimonioChartMobilizacao
          kpis={dashboard?.kpis}
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <PatrimonioChartIdade
          data={dashboard?.idadeFrota}
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <PatrimonioChartClientes
          data={dashboard?.topClientes}
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <PatrimonioChartTimeline
          data={dashboard?.timelineAquisicoes}
          isLoading={isLoading}
        />
      </Grid>
    </Grid>
  );
}
