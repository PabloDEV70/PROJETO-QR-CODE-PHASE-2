import { useMemo, useState } from 'react';
import { Alert, Grid, Stack } from '@mui/material';
import { School } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { RdoFilterBar } from '@/components/rdo/rdo-filter-bar';
import { RdoFilterDrawer } from '@/components/rdo/rdo-filter-drawer';
import { WtGauge } from '@/components/wrench-time/wt-gauge';
import { WtBenchmarkBar } from '@/components/wrench-time/wt-benchmark-bar';
import { WtThreeTierDonut } from '@/components/wrench-time/wt-three-tier-donut';
import { WtWaterfallChart } from '@/components/wrench-time/wt-waterfall-chart';
import { WtParetoChart } from '@/components/wrench-time/wt-pareto-chart';
import { WtActionPlan } from '@/components/wrench-time/wt-action-plan';
import { useRdoUrlParams } from '@/hooks/use-rdo-url-params';
import { useRdoResumo } from '@/hooks/use-rdo';
import { useWrenchTimeMetrics } from '@/hooks/use-wrench-time';
import {
  groupByAcademicTier,
  getAcademicRecommendations,
} from '@/utils/wrench-time-academic';

export function WrenchTimeEstudoPage() {
  const {
    dataInicio, dataFim, codparc, coddep, codfuncao,
    filterParams, updateParams, clearAll,
  } = useRdoUrlParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const resumo = useRdoResumo(filterParams);
  const { metrics, isLoading, error } = useWrenchTimeMetrics(filterParams);

  const tiers = useMemo(
    () => (metrics ? groupByAcademicTier(metrics.breakdowns) : []),
    [metrics],
  );
  const recommendations = useMemo(
    () => (metrics ? getAcademicRecommendations(metrics.breakdowns, metrics.wrenchTimePercent) : []),
    [metrics],
  );

  return (
    <PageLayout
      title="Estudo de Produtividade"
      subtitle="Fator de Produtividade — Visao Academica (FINOM / ENGETELES)"
      icon={School}
    >
      <RdoFilterBar
        dataInicio={dataInicio} dataFim={dataFim}
        codparc={codparc} coddep={coddep} codfuncao={codfuncao}
        onUpdateParams={updateParams} onClearAll={clearAll}
        onOpenFilters={() => setDrawerOpen(true)}
        totalRegistros={resumo.data?.totalRdos}
        totalLabel="RDOs" isLoading={resumo.isLoading}
      />

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>Erro ao carregar dados de produtividade</Alert>
      )}

      <Stack spacing={3} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <WtGauge
              wrenchTimePercent={metrics?.wrenchTimePercent ?? 0}
              isLoading={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <WtBenchmarkBar
              wrenchTimePercent={metrics?.wrenchTimePercent ?? 0}
              isLoading={isLoading}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <WtThreeTierDonut
              tiers={tiers}
              wrenchTimePercent={metrics?.wrenchTimePercent ?? 0}
              isLoading={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <WtWaterfallChart
              tiers={tiers}
              totalMin={metrics?.totalMin ?? 0}
              isLoading={isLoading}
            />
          </Grid>
        </Grid>

        <WtParetoChart
          breakdowns={metrics?.breakdowns ?? []}
          isLoading={isLoading}
        />

        <WtActionPlan
          recommendations={recommendations}
          isLoading={isLoading}
        />
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
