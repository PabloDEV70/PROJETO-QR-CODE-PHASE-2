import { Box, Paper, Typography, Skeleton } from '@mui/material';
import {
  Receipt,
  CheckCircle,
  PendingActions,
  Inventory,
  AttachMoney,
} from '@mui/icons-material';
import type { EmTempoRealResumo } from '@/types/em-tempo-real-types';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function KpiCard({ label, value, icon, color }: KpiCardProps) {
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flex: '1 1 180px',
        minWidth: 180,
      }}
      elevation={1}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}15`,
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" noWrap>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={700} noWrap>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

interface EmTempoRealKpisProps {
  resumo: EmTempoRealResumo | undefined;
  isLoading: boolean;
}

export function EmTempoRealKpis({ resumo, isLoading }: EmTempoRealKpisProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={220} height={80} />
        ))}
      </Box>
    );
  }

  if (!resumo) return null;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
      .format(v);

  const cards: KpiCardProps[] = [
    {
      label: 'Total Notas',
      value: resumo.total,
      icon: <Receipt />,
      color: '#1976d2',
    },
    {
      label: 'Liberadas',
      value: resumo.liberada,
      icon: <CheckCircle />,
      color: '#2e7d32',
    },
    {
      label: 'Pendentes',
      value: resumo.pendente,
      icon: <PendingActions />,
      color: '#ed6c02',
    },
    {
      label: 'Baixas Estoque',
      value: resumo.baixa_estoque,
      icon: <Inventory />,
      color: '#9c27b0',
    },
    {
      label: 'Valor Total',
      value: formatCurrency(resumo.valor_total),
      icon: <AttachMoney />,
      color: '#0288d1',
    },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {cards.map((c) => (
        <KpiCard key={c.label} {...c} />
      ))}
    </Box>
  );
}
