import { Stack, Paper, Typography, Skeleton } from '@mui/material';
import type { VeiculoMonitoramentoStats } from '@/types/veiculo-list-types';

interface VeiculoKpiRowProps {
  stats: VeiculoMonitoramentoStats | undefined;
  isLoading: boolean;
}

interface KpiDef {
  label: string;
  getValue: (s: VeiculoMonitoramentoStats) => number;
  color: string;
}

const KPIS: KpiDef[] = [
  { label: 'Total', getValue: (s) => s.total, color: '#1976d2' },
  { label: 'Livre', getValue: (s) => s.porStatus?.LIVRE, color: '#2e7d32' },
  { label: 'Em Uso', getValue: (s) => s.porStatus?.EM_USO, color: '#0288d1' },
  { label: 'Manutencao', getValue: (s) => s.porStatus?.MANUTENCAO, color: '#d32f2f' },
  {
    label: 'Aguard. Manut.',
    getValue: (s) => s.porStatus?.AGUARDANDO_MANUTENCAO,
    color: '#ed6c02',
  },
  {
    label: 'Bloqueio',
    getValue: (s) => s.porStatus?.BLOQUEIO_COMERCIAL,
    color: '#c62828',
  },
  {
    label: 'Contrato',
    getValue: (s) => s.porStatus?.ALUGADO_CONTRATO,
    color: '#0277bd',
  },
  { label: 'Alertas', getValue: (s) => s.comAlerta, color: '#f44336' },
];

export function VeiculoKpiRow({ stats, isLoading }: VeiculoKpiRowProps) {
  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap">
      {KPIS.map((kpi) => (
        <Paper
          key={kpi.label}
          variant="outlined"
          sx={{ px: 2, py: 1.5, minWidth: 100, flex: '1 1 0', textAlign: 'center' }}
        >
          <Typography variant="caption" color="text.secondary">
            {kpi.label}
          </Typography>
          {isLoading ? (
            <Skeleton width={40} height={32} sx={{ mx: 'auto' }} />
          ) : (
            <Typography variant="h5" fontWeight={700} sx={{ color: kpi.color }}>
              {stats ? kpi.getValue(stats) ?? 0 : 0}
            </Typography>
          )}
        </Paper>
      ))}
    </Stack>
  );
}
