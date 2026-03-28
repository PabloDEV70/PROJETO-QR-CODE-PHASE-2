import { Box, Paper, Typography, Skeleton } from '@mui/material';
import type { CorridaResumo, TempoTransitoStats } from '@/types/corrida';

interface KpiCardProps {
  label: string;
  value: number | string;
  color: string;
  loading?: boolean;
}

function KpiCard({ label, value, color, loading }: KpiCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1, minWidth: 140, p: 2, textAlign: 'center',
        borderTopColor: color, borderTopWidth: 3, borderTopStyle: 'solid',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      {loading ? (
        <Skeleton width={60} height={32} sx={{ mx: 'auto' }} />
      ) : (
        <Typography variant="h5" sx={{ fontWeight: 700, color }}>
          {value}
        </Typography>
      )}
    </Paper>
  );
}

interface CorridasKpiRowProps {
  resumo?: CorridaResumo;
  tempoTransito?: TempoTransitoStats;
  loading?: boolean;
}

export function CorridasKpiRow({ resumo, tempoTransito, loading }: CorridasKpiRowProps) {
  const avgTempo = tempoTransito
    ? `${Math.round(tempoTransito.avgMinutos)}min`
    : '-';

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <KpiCard label="Abertas" value={resumo?.abertas ?? 0} color="#ed6c02" loading={loading} />
      <KpiCard label="Em Andamento" value={resumo?.emAndamento ?? 0} color="#1976d2" loading={loading} />
      <KpiCard label="Concluidas" value={resumo?.concluidas ?? 0} color="#2e7d32" loading={loading} />
      <KpiCard label="Canceladas" value={resumo?.canceladas ?? 0} color="#d32f2f" loading={loading} />
      <KpiCard label="Tempo Medio" value={avgTempo} color="#1976d2" loading={loading} />
    </Box>
  );
}
