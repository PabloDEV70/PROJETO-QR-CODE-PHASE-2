import { useMemo } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { QuickAccessCard } from '@/components/shared/quick-access-card';
import {
  ListAlt, Assessment, People, AccessTime, Category, EventAvailable, Science,
  AccountBalance,
} from '@mui/icons-material';
import { useRdoResumo } from '@/hooks/use-rdo';
import { format, subDays } from 'date-fns';

export function HubHomePage() {
  const todayParams = useMemo(() => ({
    dataInicio: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    dataFim: format(new Date(), 'yyyy-MM-dd'),
  }), []);

  const resumo = useRdoResumo(todayParams);
  const r = resumo.data;
  const loading = resumo.isLoading;

  const cards = [
    {
      title: 'RDOs do Dia',
      description: 'Lista completa de RDOs com filtros e paginacao',
      icon: ListAlt,
      path: '/rdo',
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
      badge: r ? String(r.totalRdos) : undefined,
      badgeLoading: loading,
    },
    {
      title: 'Analytics',
      description: 'Produtividade, eficiencia e rankings',
      icon: Assessment,
      path: '/rdo/analytics',
      gradient: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
      badge: r ? `${r.totalHoras.toFixed(0)}h` : undefined,
      badgeLoading: loading,
    },
    {
      title: 'Colaboradores',
      description: 'Busca de colaborador e timeline individual',
      icon: People,
      path: '/rdo/colaborador',
      gradient: 'linear-gradient(135deg, #6a1b9a 0%, #ab47bc 100%)',
      badge: r ? String(r.totalColaboradores) : undefined,
      badgeLoading: loading,
    },
    {
      title: 'Hora Extra',
      description: 'Analise e alertas de hora extra',
      icon: AccessTime,
      path: '/rdo/analytics/hora-extra',
      gradient: 'linear-gradient(135deg, #e65100 0%, #ff9800 100%)',
    },
    {
      title: 'Motivos',
      description: 'Distribuicao de atividades produtivas vs improdutivas',
      icon: Category,
      path: '/rdo/motivos',
      gradient: 'linear-gradient(135deg, #00695c 0%, #26a69a 100%)',
    },
    {
      title: 'Assiduidade',
      description: 'Taxa de presenca e frequencia',
      icon: EventAvailable,
      path: '/rdo/analytics/assiduidade',
      gradient: 'linear-gradient(135deg, #37474f 0%, #78909c 100%)',
    },
    {
      title: 'POC Charts',
      description: 'Comparacao de graficos com dados reais',
      icon: Science,
      path: '/poc-charts',
      gradient: 'linear-gradient(135deg, #4527a0 0%, #7e57c2 100%)',
    },
    {
      title: 'Patrimonio',
      description: 'Mobilizado vs Imobilizado — Gestao de bens e contratos',
      icon: AccountBalance,
      path: '/patrimonio',
      gradient: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        GIG RDO
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Modulo de Relatorios Diarios de Obra
      </Typography>
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid key={card.path} size={{ xs: 12, sm: 6, md: 4 }}>
            <QuickAccessCard {...card} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
