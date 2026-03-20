import { Stack, Paper, Typography, Skeleton } from '@mui/material';
import type { FuncionariosResumo } from '@/types/funcionario-types';

interface FuncionariosKpiRowProps {
  resumo: FuncionariosResumo | undefined;
  isLoading: boolean;
  activeSituacao: string;
  onSituacaoClick: (situacao: string) => void;
}

interface KpiDef {
  key: string;
  label: string;
  color: string;
  situacao: string | null;
  getValue: (r: FuncionariosResumo) => number;
}

const KPIS: KpiDef[] = [
  {
    key: 'total',
    label: 'Total',
    color: '#1976d2',
    situacao: 'all',
    getValue: (r) => r.total,
  },
  {
    key: 'ativos',
    label: 'Ativos',
    color: '#2e7d32',
    situacao: '1',
    getValue: (r) => r.totalAtivos,
  },
  {
    key: 'demitidos',
    label: 'Demitidos',
    color: '#d32f2f',
    situacao: '0',
    getValue: (r) => r.totalDemitidos,
  },
  {
    key: 'afastados',
    label: 'Afastados',
    color: '#ed6c02',
    situacao: '2',
    getValue: (r) => r.totalAfastados,
  },
  {
    key: 'com-usuario',
    label: 'Com Usuario',
    color: '#7b1fa2',
    situacao: null,
    getValue: (r) => r.totalComUsuario,
  },
];

export function FuncionariosKpiRow({
  resumo, isLoading, activeSituacao, onSituacaoClick,
}: FuncionariosKpiRowProps) {
  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap">
      {KPIS.map((kpi) => {
        const isClickable = kpi.situacao !== null;
        const isActive = isClickable && activeSituacao === kpi.situacao;
        return (
          <Paper
            key={kpi.key}
            variant="outlined"
            onClick={isClickable ? () => onSituacaoClick(kpi.situacao!) : undefined}
            sx={{
              px: 2, py: 1.5, minWidth: 110, flex: '1 1 0', textAlign: 'center',
              cursor: isClickable ? 'pointer' : 'default',
              transition: 'all 0.15s',
              borderColor: isActive ? kpi.color : undefined,
              borderWidth: isActive ? 2 : 1,
              bgcolor: isActive ? `${kpi.color}08` : undefined,
              ...(isClickable && {
                '&:hover': { borderColor: kpi.color, bgcolor: `${kpi.color}06` },
              }),
            }}
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
        );
      })}
    </Stack>
  );
}
