import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import { useRdoStats } from '@/hooks/use-admin-rdos';

function formatHoras(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h}h ${m}m`;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card sx={{ flex: '1 1 140px', minWidth: 140 }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box sx={{ color }}>{icon}</Box>
          <Typography variant="caption" color="text.secondary" noWrap>
            {label}
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight={700}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

interface RdoStatsCardsProps {
  dataInicio?: string;
  dataFim?: string;
}

export function RdoStatsCards({ dataInicio, dataFim }: RdoStatsCardsProps) {
  const params = dataInicio && dataFim ? { dataInicio, dataFim } : undefined;
  const { data: stats, isLoading } = useRdoStats(params);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" width={160} height={80} />
        ))}
      </Box>
    );
  }

  if (!stats) return null;

  const cards: StatCardProps[] = [
    {
      label: 'Total RDOs',
      value: String(stats.totalRdos ?? 0),
      icon: <AssignmentIcon fontSize="small" />,
      color: '#2e7d32',
    },
    {
      label: 'Total Horas',
      value: formatHoras(Math.round((stats.totalHoras ?? 0) * 60)),
      icon: <AccessTimeIcon fontSize="small" />,
      color: '#1565c0',
    },
    {
      label: '% Produtivo',
      value: `${(stats.percentualProdutivo ?? 0).toFixed(1)}%`,
      icon: <TrendingUpIcon fontSize="small" />,
      color: '#e65100',
    },
    {
      label: 'Funcionarios',
      value: String(stats.totalFuncionarios ?? 0),
      icon: <PeopleIcon fontSize="small" />,
      color: '#6a1b9a',
    },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </Box>
  );
}
