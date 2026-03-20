import { useState } from 'react';
import { Alert, Stack } from '@mui/material';
import { TrendingDown } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { RdoFilterBar } from '@/components/rdo/rdo-filter-bar';
import { RdoFilterDrawer } from '@/components/rdo/rdo-filter-drawer';
import { WtCategoryCards } from '@/components/wrench-time/wt-category-cards';
import { WtMotivoDrill } from '@/components/wrench-time/wt-motivo-drill';
import { WtDepartmentCompare } from '@/components/wrench-time/wt-department-compare';
import { useRdoUrlParams } from '@/hooks/use-rdo-url-params';
import { useRdoResumo } from '@/hooks/use-rdo';
import { useWrenchTimeMetrics, useWrenchTimeByColab } from '@/hooks/use-wrench-time';
import type { WrenchTimeCategory, WrenchTimeBreakdown } from '@/types/wrench-time-types';

export function WrenchTimePerdasPage() {
  const {
    dataInicio, dataFim, codparc, coddep, codfuncao,
    filterParams, updateParams, clearAll,
  } = useRdoUrlParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drillCategory, setDrillCategory] = useState<WrenchTimeCategory | null>(null);

  const resumo = useRdoResumo(filterParams);
  const { metrics, isLoading, error } = useWrenchTimeMetrics(filterParams);
  const { colabs, isLoading: colabLoading } = useWrenchTimeByColab(filterParams);

  const drillBreakdown: WrenchTimeBreakdown | null =
    drillCategory && metrics
      ? metrics.breakdowns.find((b) => b.category === drillCategory) ?? null
      : null;

  return (
    <PageLayout title="Analise de Perdas" subtitle="Wrench Time — onde esta o desperdicio" icon={TrendingDown}>
      <RdoFilterBar
        dataInicio={dataInicio} dataFim={dataFim}
        codparc={codparc} coddep={coddep} codfuncao={codfuncao}
        onUpdateParams={updateParams} onClearAll={clearAll}
        onOpenFilters={() => setDrawerOpen(true)}
        totalRegistros={resumo.data?.totalRdos}
        totalLabel="RDOs" isLoading={resumo.isLoading}
      />

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>Erro ao carregar dados</Alert>
      )}

      <Stack spacing={3} sx={{ mt: 2 }}>
        <WtCategoryCards
          breakdowns={metrics?.breakdowns ?? []}
          isLoading={isLoading}
          onCategoryClick={setDrillCategory}
        />

        <WtDepartmentCompare colabs={colabs} isLoading={colabLoading} />
      </Stack>

      <WtMotivoDrill
        open={drillCategory !== null}
        onClose={() => setDrillCategory(null)}
        breakdown={drillBreakdown}
      />

      <RdoFilterDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        codparc={codparc} coddep={coddep} codfuncao={codfuncao}
        onUpdateParams={updateParams}
        filterParams={filterParams as Record<string, string | number>}
      />
    </PageLayout>
  );
}
