import { Box, Typography, Grid } from '@mui/material';
import { QuickAccessCard } from '@/components/shared/quick-access-card';
import { Build, Engineering, Dashboard, DirectionsCar } from '@mui/icons-material';

export function HubManutencaoPage() {
  const cards = [
    {
      title: 'Ordens de Servico',
      description: 'Lista e filtros de OS por periodo, status, veiculo e executor',
      icon: Build,
      path: '/manutencao/ordens-de-servico',
      gradient: 'linear-gradient(135deg, #e65100 0%, #ff9800 100%)',
    },
    {
      title: 'Servicos por Executor',
      description: 'OS e servicos executados por colaborador',
      icon: Engineering,
      path: '/manutencao/servicos-executor',
      gradient: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
    },
    {
      title: 'Dashboard',
      description: 'KPIs, MTTR, MTBF e distribuicao por status e tipo',
      icon: Dashboard,
      path: '/manutencao/dashboard',
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
    },
    {
      title: 'Historico de Veiculos',
      description: 'Timeline de manutencoes e KPIs por veiculo',
      icon: DirectionsCar,
      path: '/manutencao/veiculo-timeline',
      gradient: 'linear-gradient(135deg, #6a1b9a 0%, #ab47bc 100%)',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Manutencao
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Modulo de Ordens de Servico e Manutencao de Frota
      </Typography>
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid key={card.path} size={{ xs: 12, sm: 6, md: 6 }}>
            <QuickAccessCard {...card} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
