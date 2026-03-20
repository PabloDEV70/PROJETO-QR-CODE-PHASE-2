import { Stack, Paper, Typography, Skeleton } from '@mui/material';
import type { ChamadoResumo } from '@/types/chamados-types';

interface ChamadosKpiRowProps {
  resumo: ChamadoResumo | undefined;
  isLoading: boolean;
}

interface KpiDef {
  label: string;
  color: string;
  getValue: (r: ChamadoResumo) => number;
}

const KPIS: KpiDef[] = [
  {
    label: 'Total',
    color: '#1976d2',
    getValue: (r) => r.total,
  },
  {
    label: 'Pendentes',
    color: '#ed6c02',
    getValue: (r) => r.porStatus.find((s) => s.status === 'P')?.total ?? 0,
  },
  {
    label: 'Em Atendimento',
    color: '#0288d1',
    getValue: (r) => r.porStatus.find((s) => s.status === 'E')?.total ?? 0,
  },
  {
    label: 'Em Aprovacao',
    color: '#7b1fa2',
    getValue: (r) => r.porStatus.find((s) => s.status === 'A')?.total ?? 0,
  },
  {
    label: 'Finalizados',
    color: '#2e7d32',
    getValue: (r) => r.porStatus.find((s) => s.status === 'F')?.total ?? 0,
  },
  {
    label: 'Cancelados',
    color: '#d32f2f',
    getValue: (r) => r.porStatus.find((s) => s.status === 'C')?.total ?? 0,
  },
];

export function ChamadosKpiRow({ resumo, isLoading }: ChamadosKpiRowProps) {
  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap">
      {KPIS.map((kpi) => (
        <Paper
          key={kpi.label}
          variant="outlined"
          sx={{ px: 2, py: 1.5, minWidth: 110, flex: '1 1 0', textAlign: 'center' }}
        >
          <Typography variant="caption" color="text.secondary">
            {kpi.label}
          </Typography>
          {isLoading ? (
            <Skeleton width={40} height={32} sx={{ mx: 'auto' }} />
          ) : (
            <Typography variant="h5" fontWeight={700} sx={{ color: kpi.color }}>
              {resumo ? kpi.getValue(resumo) : 0}
            </Typography>
          )}
        </Paper>
      ))}
    </Stack>
  );
}
