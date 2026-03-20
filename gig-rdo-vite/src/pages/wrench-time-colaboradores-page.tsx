import { useState } from 'react';
import { Alert, Stack, Chip, Grid } from '@mui/material';
import { People } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { RdoFilterBar } from '@/components/rdo/rdo-filter-bar';
import { RdoFilterDrawer } from '@/components/rdo/rdo-filter-drawer';
import { WtColaboradorRanking } from '@/components/wrench-time/wt-colaborador-ranking';
import { useRdoUrlParams } from '@/hooks/use-rdo-url-params';
import { useRdoResumo } from '@/hooks/use-rdo';
import { useWrenchTimeByColab } from '@/hooks/use-wrench-time';

export function WrenchTimeColaboradoresPage() {
  const {
    dataInicio, dataFim, codparc, coddep, codfuncao,
    filterParams, updateParams, clearAll,
  } = useRdoUrlParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const resumo = useRdoResumo(filterParams);
  const { colabs, isLoading, error } = useWrenchTimeByColab(filterParams);

  const avgWt = colabs.length > 0
    ? Math.round(colabs.reduce((s, c) => s + c.wrenchTimePercent, 0) / colabs.length)
    : 0;
  const above = colabs.filter((c) => c.benchmarkStatus === 'above').length;
  const target = colabs.filter((c) => c.benchmarkStatus === 'target').length;
  const below = colabs.filter((c) => c.benchmarkStatus === 'below').length;

  return (
    <PageLayout title="Colaboradores" subtitle="Ranking Wrench Time por pessoa" icon={People}>
      <RdoFilterBar
        dataInicio={dataInicio} dataFim={dataFim}
        codparc={codparc} coddep={coddep} codfuncao={codfuncao}
        onUpdateParams={updateParams} onClearAll={clearAll}
        onOpenFilters={() => setDrawerOpen(true)}
        totalRegistros={resumo.data?.totalColaboradores}
        totalLabel="colaboradores" isLoading={resumo.isLoading}
      />

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>Erro ao carregar dados</Alert>
      )}

      <Stack spacing={3} sx={{ mt: 2 }}>
        <Grid container spacing={1.5}>
          <Grid>
            <Chip label={`Media: ${avgWt}%`} size="small"
              sx={{ fontWeight: 600, bgcolor: 'rgba(59,130,246,0.1)', color: '#3B82F6' }} />
          </Grid>
          <Grid>
            <Chip label={`${colabs.length} colaboradores`} size="small" variant="outlined" />
          </Grid>
          {above > 0 && (
            <Grid>
              <Chip label={`${above} excelente`} size="small"
                sx={{ bgcolor: 'rgba(22,163,74,0.1)', color: '#16A34A' }} />
            </Grid>
          )}
          {target > 0 && (
            <Grid>
              <Chip label={`${target} na faixa`} size="small"
                sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#F59E0B' }} />
            </Grid>
          )}
          {below > 0 && (
            <Grid>
              <Chip label={`${below} critico`} size="small"
                sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#EF4444' }} />
            </Grid>
          )}
        </Grid>

        <WtColaboradorRanking colabs={colabs} isLoading={isLoading} />
      </Stack>

      <RdoFilterDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        codparc={codparc} coddep={coddep} codfuncao={codfuncao}
        onUpdateParams={updateParams}
        filterParams={filterParams as Record<string, string | number>}
      />
    </PageLayout>
  );
}
