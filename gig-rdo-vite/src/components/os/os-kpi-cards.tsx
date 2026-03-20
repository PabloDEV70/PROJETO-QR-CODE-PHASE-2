import { Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';
import {
  Build,
  Schedule,
  TrendingUp,
  ErrorOutline,
  CheckCircle,
} from '@mui/icons-material';
import type { OsDashboardKpis } from '@/types/os-dashboard-types';

interface OsKpiCardsProps {
  data: OsDashboardKpis | undefined;
  isLoading: boolean;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'primary' | 'warning' | 'success' | 'error';
}

function KpiCard({ label, value, unit, subtitle, icon, color }: KpiCardProps) {
  return (
    <Paper sx={{
      p: 2, borderRadius: 2.5,
      borderLeft: 4, borderColor: `${color}.main`,
      height: '100%',
    }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          {icon}
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
        </Stack>
        <Typography variant="h4" fontWeight={700} color={`${color}.main`}>
          {value}{unit && <Typography component="span" variant="body2" color="text.secondary"> {unit}</Typography>}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

function LoadingCard() {
  return (
    <Paper sx={{ p: 2, borderRadius: 2.5, borderLeft: 4, borderColor: 'divider' }}>
      <Stack spacing={1}>
        <Skeleton variant="text" width={120} />
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="text" width={80} />
      </Stack>
    </Paper>
  );
}

export function OsKpiCards({ data, isLoading }: OsKpiCardsProps) {
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <LoadingCard />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!data) return null;

  const totalStatus = data.statusDistribution.aberta
    + data.statusDistribution.emExecucao
    + data.statusDistribution.finalizada
    + data.statusDistribution.cancelada;

  const completionRate = totalStatus > 0
    ? Math.round((data.statusDistribution.finalizada / totalStatus) * 100)
    : 0;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
        <KpiCard
          label="Total OS"
          value={data.totalOS}
          icon={<Build sx={{ fontSize: 20, color: 'primary.main' }} />}
          color="primary"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
        <KpiCard
          label="MTTR"
          value={data.mttrHoras?.toFixed(1) ?? '—'}
          unit="h"
          subtitle="Tempo Medio de Reparo"
          icon={<Schedule sx={{ fontSize: 20, color: 'warning.main' }} />}
          color="warning"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
        <KpiCard
          label="MTBF"
          value={data.mtbfDias?.toFixed(1) ?? '—'}
          unit="dias"
          subtitle="Tempo Medio Entre Falhas"
          icon={<TrendingUp sx={{ fontSize: 20, color: 'success.main' }} />}
          color="success"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
        <KpiCard
          label="OS Abertas"
          value={data.statusDistribution.aberta ?? 0}
          icon={<ErrorOutline sx={{ fontSize: 20, color: 'error.main' }} />}
          color="error"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
        <KpiCard
          label="Taxa de Conclusao"
          value={`${completionRate}%`}
          icon={<CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />}
          color="success"
        />
      </Grid>
    </Grid>
  );
}
