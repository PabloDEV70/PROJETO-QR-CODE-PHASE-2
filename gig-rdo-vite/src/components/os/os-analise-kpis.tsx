import { Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';
import {
  Build,
  Schedule,
  Category,
  DirectionsCar,
} from '@mui/icons-material';
import type { OsAnaliseTipoVeiculo } from '@/types/os-analise-types';

interface OsAnaliseKpisProps {
  data: OsAnaliseTipoVeiculo[] | undefined;
  isLoading: boolean;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color: 'primary' | 'warning' | 'success' | 'error';
}

function KpiCard({ label, value, unit, icon, color }: KpiCardProps) {
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
          {value}
          {unit && (
            <Typography component="span" variant="body2" color="text.secondary">
              {' '}{unit}
            </Typography>
          )}
        </Typography>
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
      </Stack>
    </Paper>
  );
}

export function OsAnaliseKpis({ data, isLoading }: OsAnaliseKpisProps) {
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, sm: 3 }}>
            <LoadingCard />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!data?.length) return null;

  const totalOs = data.reduce((s, r) => s + r.totalOs, 0);
  const totalExec = data.reduce((s, r) => s + r.totalExecucoes, 0);
  const totalVeiculos = data.reduce((s, r) => s + r.veiculosDistintos, 0);

  const weightedSum = data.reduce(
    (s, r) => s + (r.mediaMinutos ?? 0) * r.totalExecucoes, 0,
  );
  const mediaGlobal = totalExec > 0 ? weightedSum / totalExec : 0;
  const mediaHoras = (mediaGlobal / 60).toFixed(1);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 3 }}>
        <KpiCard
          label="Total OS"
          value={totalOs.toLocaleString('pt-BR')}
          icon={<Build sx={{ fontSize: 20, color: 'primary.main' }} />}
          color="primary"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <KpiCard
          label="Media Execucao"
          value={mediaHoras}
          unit="h"
          icon={<Schedule sx={{ fontSize: 20, color: 'warning.main' }} />}
          color="warning"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <KpiCard
          label="Tipos Distintos"
          value={data.length}
          icon={<Category sx={{ fontSize: 20, color: 'success.main' }} />}
          color="success"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <KpiCard
          label="Veiculos Distintos"
          value={totalVeiculos.toLocaleString('pt-BR')}
          icon={<DirectionsCar sx={{ fontSize: 20, color: 'error.main' }} />}
          color="error"
        />
      </Grid>
    </Grid>
  );
}
