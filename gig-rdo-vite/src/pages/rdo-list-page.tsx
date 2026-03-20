import { useState, useCallback, useMemo } from 'react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { Stack, Box } from '@mui/material';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { PageLayout } from '@/components/layout/page-layout';
import { RdoFilterBar } from '@/components/rdo/rdo-filter-bar';
import { RdoFilterDrawer } from '@/components/rdo/rdo-filter-drawer';
import { RdoAlertsPanel } from '@/components/rdo/rdo-alerts-panel';
import { RdoResumoTexto } from '@/components/rdo/rdo-resumo-texto';
import { RdoColaboradorDrawer } from '@/components/rdo/rdo-colaborador-drawer';
import { RdoFavoritosBar } from '@/components/rdo/rdo-favoritos-bar';
import { RdoTabsSection } from '@/components/rdo/rdo-tabs-section';
import { RdoListDashboard } from '@/components/rdo/rdo-list-dashboard';
import { useRdoUrlParams } from '@/hooks/use-rdo-url-params';
import { useRdoPageQueries } from '@/hooks/use-rdo-page-queries';
import { useRdoDashboardData } from '@/hooks/use-rdo-dashboard';
import { useHorasEsperadas } from '@/hooks/use-horas-esperadas';
import { computeAlerts } from '@/utils/rdo-alert-engine';
import type { Density } from '@/utils/rdo-filter-helpers';

export function RdoListPage() {
  const {
    dataInicio, dataFim, codparc, rdomotivocod,
    page, limit, tab, density, coddep, codfuncao,
    listParams, filterParams,
    updateParams, clearAll, handlePagination,
  } = useRdoUrlParams();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [drawerCodparc, setDrawerCodparc] = useState<number | null>(null);
  const apiFilterParams = filterParams as Record<string, string | number>;

  const q = useRdoPageQueries({
    listParams, filterParams, apiFilterParams, tab, rdomotivocod: rdomotivocod ?? undefined,
  });
  const horasEsp = useHorasEsperadas({
    dataInicio, dataFim, coddep: coddep ?? undefined, codparc: codparc ?? undefined,
  });

  const rdoData = q.rdoList.data;

  const dashboard = useRdoDashboardData(
    q.rdoMotivos.data?.data, q.resumo.data?.totalMinutosPrevistos,
  );
  const alerts = useMemo(() => computeAlerts({
    produtividade: q.produtividade.data,
    assiduidade: q.assiduidade.data?.data,
    dashboard, dataInicio, dataFim,
  }), [q.produtividade.data, q.assiduidade.data, dashboard, dataInicio, dataFim]);

  const activeQuery = tab === 1 ? q.detalhes : q.rdoList;
  const totalLabel = tab === 1 ? 'itens' : 'RDOs';
  const totalCount = activeQuery.data?.meta?.totalRegistros;
  const treemapGroups = dashboard?.treemap.groups ?? [];
  const treemapTotal = dashboard?.treemap.totalMin ?? 0;
  const hasExcedentes = dashboard?.treemap.hasExcedentes ?? false;
  const totalDias = dataInicio && dataFim
    ? differenceInCalendarDays(parseISO(dataFim), parseISO(dataInicio)) + 1
    : undefined;

  const jornadaMin = q.resumo.data?.totalMinutosPrevistos ?? 0;
  const metaEfMin = dashboard?.productivity.totalMetaEfetivaMin ?? 0;
  const tolRatio = jornadaMin > 0 ? metaEfMin / jornadaMin : 1;
  const horasEspAjustadas = horasEsp.data
    ? horasEsp.data.resumo.totalHorasEsperadas * tolRatio : undefined;

  const onPaginationChange = useCallback(
    (m: GridPaginationModel) => handlePagination({ page: m.page + 1, pageSize: m.pageSize }),
    [handlePagination]);
  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, v: number) => updateParams({ tab: v ? String(v) : null, page: null }),
    [updateParams]);
  const handleMotivoClick = useCallback(
    (cod: number | null) => { if (cod != null) updateParams({ tab: '1', rdomotivocod: String(cod) }); },
    [updateParams]);

  const drawerRow = useMemo(
    () => q.produtividade.data?.find((p) => p.codparc === drawerCodparc),
    [q.produtividade.data, drawerCodparc],
  );

  return (
    <PageLayout title="RDOs">
      <Stack spacing={2.5}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <RdoFilterBar
            codparc={codparc} dataInicio={dataInicio} dataFim={dataFim}
            coddep={coddep} codfuncao={codfuncao}
            onUpdateParams={updateParams} onClearAll={clearAll}
            onOpenFilters={() => setFiltersOpen(true)}
            totalRegistros={totalCount} totalLabel={totalLabel}
            isLoading={activeQuery.isFetching}
          />
        </Box>
        <RdoFavoritosBar produtividade={q.produtividade.data}
          onColaboradorClick={setDrawerCodparc} />
        <RdoAlertsPanel alerts={alerts} isLoading={q.resumo.isLoading}
          onNavigate={(p) => updateParams(p)} />
        <RdoResumoTexto resumo={q.resumo.data} productivity={dashboard?.productivity}
          alerts={alerts} dataInicio={dataInicio} dataFim={dataFim}
          isLoading={q.resumo.isLoading} />
        <RdoListDashboard
          dashboard={dashboard} resumo={q.resumo.data}
          comparativo={q.comparativo.data} timeline={q.timeline.data}
          produtividade={q.produtividade.data}
          treemapGroups={treemapGroups} treemapTotal={treemapTotal}
          hasExcedentes={hasExcedentes} horasEspAjustadas={horasEspAjustadas}
          totalDias={totalDias} dataInicio={dataInicio} dataFim={dataFim}
          configMode="ESTRITO"
          isLoadingResumo={q.resumo.isLoading} isLoadingMotivos={q.rdoMotivos.isLoading}
          isLoadingTimeline={q.timeline.isLoading}
          isLoadingProdutividade={q.produtividade.isLoading}
          onMotivoClick={handleMotivoClick} onColaboradorClick={setDrawerCodparc}
        />
        <RdoTabsSection
          tab={tab} onTabChange={handleTabChange}
          rdoData={rdoData} rdoLoading={q.rdoList.isLoading}
          detalhes={q.detalhes.data} detalhesLoading={q.detalhes.isLoading}
          error={activeQuery.error as Error | null}
          filterParams={apiFilterParams} page={page} pageSize={limit}
          density={density as Density}
          onDensityChange={(d) => updateParams({ density: d })}
          onPaginationChange={onPaginationChange}
          motivosOpts={q.motivosOpts.data}
          rdomotivocod={rdomotivocod}
          onClearMotivo={() => updateParams({ rdomotivocod: null })}
        />
        <RdoFilterDrawer
          open={filtersOpen} onClose={() => setFiltersOpen(false)}
          codparc={codparc} coddep={coddep} codfuncao={codfuncao}
          onUpdateParams={updateParams} filterParams={apiFilterParams}
        />
        <RdoColaboradorDrawer codparc={drawerCodparc} open={!!drawerCodparc}
          onClose={() => setDrawerCodparc(null)} filterParams={apiFilterParams}
          nome={drawerRow?.nomeparc} cargo={drawerRow?.cargo ?? undefined}
          departamento={drawerRow?.departamento ?? undefined} />
      </Stack>
    </PageLayout>
  );
}
