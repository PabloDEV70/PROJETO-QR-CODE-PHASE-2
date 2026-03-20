import { Stack, Paper, Typography, Skeleton } from '@mui/material';
import type { ApontamentoResumo } from '@/types/apontamentos-types';

interface ApontamentosKpiRowProps {
  resumo: ApontamentoResumo | undefined;
  isLoading: boolean;
}

interface KpiDef {
  label: string;
  key: keyof ApontamentoResumo;
  color: string;
  suffix?: string;
}

const KPIS: KpiDef[] = [
  { label: 'Total Servicos', key: 'TOTAL_SERVICOS', color: '#1976d2' },
  { label: 'Apontamentos', key: 'TOTAL_APONTAMENTOS', color: '#7b1fa2' },
  { label: 'Com OS', key: 'TOTAL_COM_OS', color: '#2e7d32' },
  { label: 'Pendentes', key: 'TOTAL_PENDENTES_OS', color: '#ed6c02' },
  { label: '% Com OS', key: 'PERC_COM_OS', color: '#0288d1', suffix: '%' },
  { label: 'Veiculos', key: 'VEICULOS_DISTINTOS', color: '#6a1b9a' },
];

export function ApontamentosKpiRow({ resumo, isLoading }: ApontamentosKpiRowProps) {
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
              {resumo?.[kpi.key] ?? 0}{kpi.suffix ?? ''}
            </Typography>
          )}
        </Paper>
      ))}
    </Stack>
  );
}
