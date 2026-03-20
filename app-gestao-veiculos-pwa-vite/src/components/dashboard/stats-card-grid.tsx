import { Box } from '@mui/material';
import { DirectionsCar, Warning, PriorityHigh, ErrorOutline, Schedule, Build, Engineering, LocalShipping } from '@mui/icons-material';
import { StatCard } from '@/components/dashboard/stat-card';
import type { HstVeiStats } from '@/types/hstvei-types';

interface StatsCardGridProps {
  stats: HstVeiStats | undefined;
}

export function StatsCardGrid({ stats }: StatsCardGridProps) {
  if (!stats) return null;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1 }}>
      <StatCard icon={DirectionsCar} value={stats.veiculosComSituacao} label="Veiculos" />
      <StatCard icon={Warning} value={stats.situacoesAtivas} label="Situacoes" color="#ffa726" />
      <StatCard icon={PriorityHigh} value={stats.urgentes} label="Urgentes" color="#f44336" />
      <StatCard icon={ErrorOutline} value={stats.atrasadas} label="Atrasadas" color="#f44336" />
      <StatCard icon={Schedule} value={stats.previsao3dias} label="Previsao 3d" color="#9e9e9e" />
      <StatCard icon={Build} value={stats.veiculosManutencao} label="Manutencao" />
      <StatCard icon={Engineering} value={stats.veiculosComercial} label="Comercial" />
      <StatCard icon={LocalShipping} value={stats.veiculosLogistica} label="Logistica" />
    </Box>
  );
}
