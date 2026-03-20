/**
 * V1 RDO Dashboard — replica fiel do layout original Next.js (ManutencaoRdoContent).
 * Layout: FilterBar -> KpiRow(6 cards) -> Treemap -> TabsSection
 */
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { Stack, Box } from '@mui/material';
import { PageLayout } from '@/components/layout/page-layout';
import { RdoFilterBar } from '@/components/rdo/rdo-filter-bar';
import { RdoFilterDrawer } from '@/components/rdo/rdo-filter-drawer';
import { RdoKpiRowV1 } from '@/components/rdo/rdo-kpi-row-v1';
import { RdoMotivoTreemap } from '@/components/rdo/rdo-motivo-treemap';
import { RdoHorasTrendV1 } from '@/components/rdo/rdo-horas-trend-v1';
import { RdoTabsSection } from '@/components/rdo/rdo-tabs-section';
import { useRdoV1Page } from '@/hooks/use-rdo-v1-page';

export function RdoListV1Page() {
  const p = useRdoV1Page();

  const treemapGroups = p.dashboard?.treemap.groups ?? [];
  const treemapTotal = p.dashboard?.treemap.totalMin ?? 0;
  const hasExcedentes = p.dashboard?.treemap.hasExcedentes ?? false;
  const totalDias = p.dataInicio && p.dataFim
    ? differenceInCalendarDays(parseISO(p.dataFim), parseISO(p.dataInicio)) + 1
    : undefined;
  const totalLabel = p.tab === 1 ? 'itens' : 'RDOs';
  const totalCount = p.activeQuery.data?.meta?.totalRegistros;

  const jornadaMin = p.resumo.data?.totalMinutosPrevistos ?? 0;
  const metaEfMin = p.dashboard?.productivity.totalMetaEfetivaMin ?? 0;
  const toleranciaRatio = jornadaMin > 0 ? metaEfMin / jornadaMin : 1;
  const horasEspAjustadas = p.horasEsp.data
    ? p.horasEsp.data.resumo.totalHorasEsperadas * toleranciaRatio : undefined;

  return (
    <PageLayout title="RDO" subtitle="Relatorio Diario de Obra — V1">
      <Stack spacing={2.5}>
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <RdoFilterBar
              dataInicio={p.dataInicio} dataFim={p.dataFim}
              codparc={p.codparc} coddep={p.coddep} codfuncao={p.codfuncao}
              onUpdateParams={p.updateParams} onClearAll={p.clearAll}
              onOpenFilters={() => p.setFiltersOpen(true)}
              totalRegistros={totalCount} totalLabel={totalLabel}
              isLoading={p.activeQuery.isFetching}
            />
          </Box>
        </Stack>

        <Stack spacing={2.5} data-pdf-section="dashboard">
          <RdoKpiRowV1
            resumo={p.resumo.data} comparativo={p.comparativo.data}
            isLoading={p.resumo.isLoading}
            motivoGroups={treemapGroups} motivoTotalMin={treemapTotal}
            productivity={p.dashboard?.productivity}
          />
          {treemapGroups.length > 0 && (
            <RdoMotivoTreemap
              groups={treemapGroups} totalMin={treemapTotal}
              isLoading={p.rdoMotivos.isLoading}
              onMotivoClick={p.handleMotivoClick}
              hasExcedentes={hasExcedentes} rawTotalMin={p.dashboard?.rawTotalMin}
              totalDias={totalDias} horasEsperadas={horasEspAjustadas}
              metaPercent={p.dashboard?.productivity.prodVsMetaPercent}
              metaEfetivaMin={p.dashboard?.productivity.totalMetaEfetivaMin}
            />
          )}
        </Stack>

        <RdoHorasTrendV1 data={p.timeline.data} resumo={p.resumo.data}
          isLoading={p.timeline.isLoading}
          configMode="ESTRITO" productivity={p.dashboard?.productivity}
          dataInicio={p.dataInicio} dataFim={p.dataFim} totalDias={totalDias} />

        <RdoTabsSection
          tab={p.tab} onTabChange={p.handleTabChange}
          rdoData={p.rdoData} rdoLoading={p.rdoList.isLoading}
          detalhes={p.detalhes.data} detalhesLoading={p.detalhes.isLoading}
          error={p.activeQuery.error as Error | null}
          filterParams={p.apiFilterParams}
          page={p.page} pageSize={p.limit}
          density={p.density} onDensityChange={p.handleDensity}
          onPaginationChange={p.handleGridPage}
          motivosOpts={p.motivosOpts.data}
          rdomotivocod={p.rdomotivocod}
          onClearMotivo={p.handleClearMotivo}
        />
      </Stack>

      <RdoFilterDrawer
        open={p.filtersOpen} onClose={() => p.setFiltersOpen(false)}
        codparc={p.codparc} coddep={p.coddep} codfuncao={p.codfuncao}
        onUpdateParams={p.updateParams}
        filterParams={p.apiFilterParams}
      />
    </PageLayout>
  );
}
