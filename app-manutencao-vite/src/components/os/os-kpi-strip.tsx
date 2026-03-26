import { Box, Typography, Stack, Skeleton, Paper } from '@mui/material';
import {
  BuildRounded, EngineeringRounded, CheckCircleRounded,
  DirectionsCarRounded, WarningAmberRounded,
} from '@mui/icons-material';
import type { OsResumo } from '@/types/os-types';

interface KpiCardProps {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

function KpiCard({ label, value, color, icon }: KpiCardProps) {
  return (
    <Paper variant="outlined" sx={{
      flex: '1 1 0', minWidth: 130,
      px: 2, py: 1.25,
      display: 'flex', alignItems: 'center', gap: 1.5,
    }}>
      <Box sx={{ color, display: 'flex' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1, color }}>
          {value.toLocaleString('pt-BR')}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

interface Props {
  resumo?: OsResumo;
  isLoading?: boolean;
  ativasCount?: number;
}

export function OsKpiStrip({ resumo, isLoading }: Props) {
  if (isLoading) {
    return (
      <Stack direction="row" spacing={1.5} sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: 1.5 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rounded" height={56} sx={{ flex: '1 1 0', minWidth: 130 }} />
        ))}
      </Stack>
    );
  }

  if (!resumo) return null;

  const cards: KpiCardProps[] = [
    { label: 'Abertas', value: resumo.abertas, color: '#f59e0b', icon: <BuildRounded /> },
    { label: 'Em Execucao', value: resumo.emExecucao, color: '#0ea5e9', icon: <EngineeringRounded /> },
    { label: 'Finalizadas', value: resumo.fechadas, color: '#22c55e', icon: <CheckCircleRounded /> },
    { label: 'Veiculos', value: resumo.veiculosAtendidos, color: '#8b5cf6', icon: <DirectionsCarRounded /> },
    { label: 'Canceladas', value: resumo.canceladas, color: '#ef4444', icon: <WarningAmberRounded /> },
  ];

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        px: { xs: 1.5, sm: 2, md: 3 }, py: 1.5,
        overflowX: 'auto',
        '&::-webkit-scrollbar': { height: 0 },
      }}
    >
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </Stack>
  );
}
