import { useRef, useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import { useHstVeiStats } from '@/hooks/use-hstvei-stats';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { StatsBar } from '@/components/painel/stats-bar';
import { VeiculoCard } from '@/components/painel/veiculo-card';
import { FiltroDepartamento } from '@/components/painel/filtro-departamento';
import { AutoScrollOverlay } from '@/components/painel/auto-scroll-overlay';
import { ClockDisplay } from '@/components/painel/clock-display';
import { ProximosSidebar } from '@/components/painel/proximos-sidebar';
import { usePainelStore } from '@/stores/painel-store';

export function PainelPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: painel, isLoading } = useHstVeiPainel();
  const { data: stats } = useHstVeiStats();
  const departmentFilter = usePainelStore((s) => s.departmentFilter);

  useAutoScroll(containerRef);

  const veiculos = useMemo(() => {
    if (!painel?.veiculos) return [];
    if (departmentFilter === null) return painel.veiculos;
    return painel.veiculos.filter((v) =>
      v.situacoesAtivas.some((s) => s.coddep === departmentFilter),
    );
  }, [painel, departmentFilter]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <StatsBar stats={stats} />
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Box
          ref={containerRef}
          sx={{ flex: 1, overflow: 'auto', p: 2 }}
          onMouseEnter={() => usePainelStore.getState().setIsPaused(true)}
          onMouseLeave={() => usePainelStore.getState().setIsPaused(false)}
        >
          {veiculos.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
              Nenhum veiculo com situacoes ativas
            </Typography>
          ) : (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' },
              gap: 1.5,
            }}>
              {veiculos.map((v) => (
                <VeiculoCard key={v.codveiculo} veiculo={v} />
              ))}
            </Box>
          )}
        </Box>
        <ProximosSidebar />
      </Box>
      <FiltroDepartamento />
      <AutoScrollOverlay />
      <ClockDisplay />
    </Box>
  );
}
