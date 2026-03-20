import { Card, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import type { VehicleKpis } from '@/types/vehicle-detail-types';

interface VehicleKpiCardsProps {
  kpis?: VehicleKpis;
  isLoading: boolean;
}

export function VehicleKpiCards({ kpis, isLoading }: VehicleKpiCardsProps) {
  const formatMttr = (hours: number | null) => {
    if (hours === null) return '—';
    return `${hours.toFixed(1)}h`;
  };

  const formatMtbf = (days: number | null) => {
    if (days === null) return '—';
    return `${days.toFixed(0)} dias`;
  };

  const formatAvailability = (percent: number | null) => {
    if (percent === null) return '—';
    return `${percent.toFixed(1)}%`;
  };

  const kpiItems = [
    { label: 'Total de OS', value: kpis?.totalOS ?? 0 },
    { label: 'MTTR', value: formatMttr(kpis?.mttrHoras ?? null) },
    { label: 'MTBF', value: formatMtbf(kpis?.mtbfDias ?? null) },
    { label: 'Disponibilidade', value: formatAvailability(kpis?.availability ?? null) },
  ];

  return (
    <Grid container spacing={2}>
      {kpiItems.map((item, idx) => (
        <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {item.label}
              </Typography>
              {isLoading ? (
                <Skeleton width="60%" height={32} />
              ) : (
                <Typography variant="h6">{item.value}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
