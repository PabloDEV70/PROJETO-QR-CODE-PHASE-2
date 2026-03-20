import { Box, IconButton, Tooltip } from '@mui/material';
import {
  DirectionsCar, Warning, Schedule, PriorityHigh,
  Build, Engineering, LocalShipping, ErrorOutline,
  DarkMode, LightMode,
} from '@mui/icons-material';
import { StatsMetric } from '@/components/painel/stats-metric';
import { useThemeStore } from '@/stores/theme-store';
import type { HstVeiStats } from '@/types/hstvei-types';

interface StatsBarProps {
  stats: HstVeiStats | undefined;
}

export function StatsBar({ stats }: StatsBarProps) {
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  if (!stats) return null;

  return (
    <Box sx={{
      display: 'flex', flexWrap: 'wrap', gap: 0.5, px: 2, py: 1,
      bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider',
    }}>
      <StatsMetric icon={DirectionsCar} value={stats.veiculosComSituacao} label="Veiculos" />
      <StatsMetric icon={Warning} value={stats.situacoesAtivas} label="Situacoes" color="#ffa726" />
      <StatsMetric icon={PriorityHigh} value={stats.urgentes} label="Urgentes" color="#f44336" />
      <StatsMetric icon={ErrorOutline} value={stats.atrasadas} label="Atrasadas" color="#f44336" />
      <StatsMetric icon={Schedule} value={stats.previsao3dias} label="Previsao 3d" color="#9e9e9e" />
      <StatsMetric icon={Build} value={stats.veiculosManutencao} label="Manutencao" />
      <StatsMetric icon={Engineering} value={stats.veiculosComercial} label="Comercial" />
      <StatsMetric icon={LocalShipping} value={stats.veiculosLogistica} label="Logistica" />
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
        <Tooltip title={mode === 'light' ? 'Modo escuro' : 'Modo claro'}>
          <IconButton onClick={toggleTheme} size="small">
            {mode === 'light' ? <DarkMode sx={{ fontSize: 20 }} /> : <LightMode sx={{ fontSize: 20 }} />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
