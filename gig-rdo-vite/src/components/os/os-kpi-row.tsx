import { Stack, Paper, Typography, Skeleton } from '@mui/material';
import type { OsResumo } from '@/types/os-list-types';

interface OsKpiRowProps {
  resumo: OsResumo | undefined;
  isLoading: boolean;
}

interface KpiDef {
  label: string;
  key: keyof OsResumo;
  color: string;
}

const KPIS: KpiDef[] = [
  { label: 'Total OS', key: 'totalOs', color: '#1976d2' },
  { label: 'Abertas', key: 'abertas', color: '#ed6c02' },
  { label: 'Em Execucao', key: 'emExecucao', color: '#0288d1' },
  { label: 'Fechadas', key: 'fechadas', color: '#2e7d32' },
  { label: 'Canceladas', key: 'canceladas', color: '#d32f2f' },
  { label: 'Veiculos', key: 'veiculosAtendidos', color: '#7b1fa2' },
];

export function OsKpiRow({ resumo, isLoading }: OsKpiRowProps) {
  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap">
      {KPIS.map((kpi) => (
        <Paper
          key={kpi.key}
          variant="outlined"
          sx={{ px: 2, py: 1.5, minWidth: 120, flex: '1 1 0', textAlign: 'center' }}
        >
          <Typography variant="caption" color="text.secondary">
            {kpi.label}
          </Typography>
          {isLoading ? (
            <Skeleton width={40} height={32} sx={{ mx: 'auto' }} />
          ) : (
            <Typography variant="h5" fontWeight={700} sx={{ color: kpi.color }}>
              {resumo?.[kpi.key] ?? 0}
            </Typography>
          )}
        </Paper>
      ))}
    </Stack>
  );
}
