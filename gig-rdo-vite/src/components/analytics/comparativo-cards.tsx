import { Grid, Paper, Typography, Stack, Skeleton } from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';
import type { RdoComparativo } from '@/types/rdo-analytics-types';

function DeltaChip({
  value,
  suffix = '',
  inverse = false,
}: {
  value: number;
  suffix?: string;
  inverse?: boolean;
}) {
  const positive = inverse ? value < 0 : value > 0;
  const color = value === 0 ? 'text.secondary' : positive ? 'success.main' : 'error.main';

  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : TrendingFlat;
  const displayValue = value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);

  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color }}>
      <Icon fontSize="small" />
      <Typography variant="caption" sx={{ fontWeight: 500 }}>
        {displayValue}
        {suffix}
      </Typography>
    </Stack>
  );
}

function MetricCard({
  label,
  atual,
  anterior,
  delta,
  suffix = '',
  inverse = false,
  isLoading,
}: {
  label: string;
  atual: number;
  anterior: number;
  delta: number;
  suffix?: string;
  inverse?: boolean;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="80%" height={40} />
        <Skeleton variant="text" width="50%" />
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, my: 1 }}>
        {atual.toLocaleString('pt-BR')}
        {suffix}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="caption" color="text.secondary">
          Anterior: {anterior.toLocaleString('pt-BR')}
          {suffix}
        </Typography>
        <DeltaChip value={delta} suffix={suffix} inverse={inverse} />
      </Stack>
    </Paper>
  );
}

interface ComparativoCardsProps {
  data?: RdoComparativo;
  isLoading: boolean;
}

export function ComparativoCards({ data, isLoading }: ComparativoCardsProps) {
  const metrics = [
    {
      label: 'Total RDOs',
      atual: data?.atual.totalRdos ?? 0,
      anterior: data?.anterior.totalRdos ?? 0,
      delta: data?.deltas.totalRdos ?? 0,
      suffix: '',
      inverse: false,
    },
    {
      label: 'Colaboradores',
      atual: data?.atual.totalColaboradores ?? 0,
      anterior: data?.anterior.totalColaboradores ?? 0,
      delta: data?.deltas.totalColaboradores ?? 0,
      suffix: '',
      inverse: false,
    },
    {
      label: 'Horas',
      atual: data?.atual.totalHoras ?? 0,
      anterior: data?.anterior.totalHoras ?? 0,
      delta: data?.deltas.totalHoras ?? 0,
      suffix: 'h',
      inverse: false,
    },
    {
      label: 'Média min/item',
      atual: data?.atual.mediaMinutosPorItem ?? 0,
      anterior: data?.anterior.mediaMinutosPorItem ?? 0,
      delta: data?.deltas.mediaMinutosPorItem ?? 0,
      suffix: ' min',
      inverse: true,
    },
  ];

  return (
    <Grid container spacing={2}>
      {metrics.map((metric) => (
        <Grid size={{ xs: 6, md: 3 }} key={metric.label}>
          <MetricCard {...metric} isLoading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
}
