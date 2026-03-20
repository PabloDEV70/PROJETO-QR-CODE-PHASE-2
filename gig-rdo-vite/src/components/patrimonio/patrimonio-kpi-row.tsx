import { Stack, Paper, Typography, Skeleton, Tooltip } from '@mui/material';
import type { PatrimonioDashboardKpis } from '@/types/patrimonio-types';

interface PatrimonioKpiRowProps {
  kpis: PatrimonioDashboardKpis | undefined;
  isLoading: boolean;
}

interface KpiDef {
  label: string;
  key: keyof PatrimonioDashboardKpis;
  format: 'number' | 'currency';
  color: string;
  tooltip: string;
}

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const KPIS: KpiDef[] = [
  {
    label: 'Total de Bens',
    key: 'totalBens',
    format: 'number',
    color: '#1976d2',
    tooltip: 'Quantidade total de bens ativos no modulo de patrimonio (TCIBEM sem baixa)',
  },
  {
    label: 'Valor Patrimonio',
    key: 'valorPatrimonio',
    format: 'currency',
    color: '#2e7d32',
    tooltip: 'Soma dos valores de aquisicao de todos os bens ativos',
  },
  {
    label: 'Mobilizados',
    key: 'mobilizados',
    format: 'number',
    color: '#ed6c02',
    tooltip: 'Veiculos com OS pendente em cliente (TCSOSE.SITUACAO = P)',
  },
  {
    label: 'Disponiveis',
    key: 'disponiveis',
    format: 'number',
    color: '#2e7d32',
    tooltip: 'Veiculos ativos sem OS pendente — disponiveis para mobilizacao',
  },
  {
    label: 'Sem Patrimonio',
    key: 'semPatrimonio',
    format: 'number',
    color: '#d32f2f',
    tooltip: 'Veiculos ativos sem cadastro no modulo de patrimonio (TGFVEI sem match em TCIBEM)',
  },
  {
    label: 'Alertas Comiss.',
    key: 'alertasComissionamento',
    format: 'number',
    color: '#ed6c02',
    tooltip: 'Veiculos com comissionamento vencendo nos proximos 30 dias',
  },
];

const formatValue = (kpi: KpiDef, value: number) =>
  kpi.format === 'currency' ? fmtCurrency(value) : value.toLocaleString('pt-BR');

export function PatrimonioKpiRow({ kpis, isLoading }: PatrimonioKpiRowProps) {
  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap">
      {KPIS.map((kpi) => (
        <Tooltip key={kpi.key} title={kpi.tooltip} arrow placement="top">
          <Paper
            variant="outlined"
            sx={{ px: 2, py: 1.5, minWidth: 120, flex: '1 1 0', textAlign: 'center', cursor: 'help' }}
          >
            <Typography variant="caption" color="text.secondary">
              {kpi.label}
            </Typography>
            {isLoading ? (
              <Skeleton width={60} height={32} sx={{ mx: 'auto' }} />
            ) : (
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: kpi.color, fontSize: kpi.format === 'currency' ? '1.1rem' : undefined }}
              >
                {kpis ? formatValue(kpi, kpis[kpi.key]) : 0}
              </Typography>
            )}
          </Paper>
        </Tooltip>
      ))}
    </Stack>
  );
}
