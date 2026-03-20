import { Box, Paper, Typography, CircularProgress, Grid } from '@mui/material';
import {
  DirectionsCar, Assignment, Warning, AccessTime,
  Build, Store, LocalShipping, Engineering,
} from '@mui/icons-material';
import { useHstVeiStats } from '@/hooks/use-hstvei';
import type { SvgIconComponent } from '@mui/icons-material';

interface KpiCardProps {
  label: string;
  value: number | undefined;
  icon: SvgIconComponent;
  color: string;
}

function KpiCard({ label, value, icon: Icon, color }: KpiCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          width: 48, height: 48,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}14`,
        }}
      >
        <Icon sx={{ fontSize: 24, color }} />
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {value ?? '-'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

const kpiConfig: { key: string; label: string; icon: SvgIconComponent; color: string }[] = [
  { key: 'veiculosComSituacao', label: 'Veiculos c/ Situacao', icon: DirectionsCar, color: '#1976d2' },
  { key: 'situacoesAtivas', label: 'Situacoes Ativas', icon: Assignment, color: '#2e7d32' },
  { key: 'urgentes', label: 'Urgentes', icon: Warning, color: '#d32f2f' },
  { key: 'atrasadas', label: 'Atrasadas', icon: AccessTime, color: '#ed6c02' },
  { key: 'veiculosManutencao', label: 'Manutencao', icon: Build, color: '#7b1fa2' },
  { key: 'veiculosComercial', label: 'Comercial', icon: Store, color: '#0288d1' },
  { key: 'veiculosLogistica', label: 'Logistica', icon: LocalShipping, color: '#388e3c' },
  { key: 'veiculosOperacao', label: 'Operacao', icon: Engineering, color: '#f57c00' },
];

export function DashboardPage() {
  const { data: stats, isLoading } = useHstVeiStats();

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
        Dashboard
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {kpiConfig.map(({ key, label, icon, color }) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={key}>
              <KpiCard
                label={label}
                value={stats?.[key as keyof typeof stats]}
                icon={icon}
                color={color}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
