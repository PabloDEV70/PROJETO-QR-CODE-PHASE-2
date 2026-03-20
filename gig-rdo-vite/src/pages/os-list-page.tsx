import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Stack } from '@mui/material';
import { Build } from '@mui/icons-material';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { PageLayout } from '@/components/layout/page-layout';
import { RdoFilterBar } from '@/components/rdo/rdo-filter-bar';
import { RdoFilterDrawer } from '@/components/rdo/rdo-filter-drawer';
import { OsExtraFilters } from '@/components/os/os-extra-filters';
import { OsKpiRow } from '@/components/os/os-kpi-row';
import { OsDataGrid } from '@/components/os/os-data-grid';
import { OsColabPanel } from '@/components/os/os-colab-panel';
import { useRdoUrlParams } from '@/hooks/use-rdo-url-params';
import { useOsList, useOsResumo, useOsColabServicos } from '@/hooks/use-os-list';
import type { OsListParams } from '@/types/os-list-types';

export function OsListPage() {
  const {
    dataInicio, dataFim, codparc, coddep, codfuncao,
    filterParams, updateParams, clearAll, page,
  } = useRdoUrlParams();
  const [searchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const status = searchParams.get('status');
  const tipo = searchParams.get('tipo');
  const manutencao = searchParams.get('manutencao');

  const osParams = useMemo<OsListParams>(() => ({
    dataInicio,
    dataFim,
    codparcexec: codparc || undefined,
    status: status || undefined,
    tipo: tipo || undefined,
    manutencao: manutencao || undefined,
    page,
    limit: 30,
  }), [dataInicio, dataFim, codparc, status, tipo, manutencao, page]);

  const listQuery = useOsList(osParams);
  const resumoQuery = useOsResumo(osParams);
  const colabQuery = useOsColabServicos(
    codparc ? { codparc, dataInicio, dataFim } : null,
  );

  const handlePageChange = useCallback((model: GridPaginationModel) => {
    updateParams({ page: String(model.page + 1), limit: String(model.pageSize) });
  }, [updateParams]);

  const pagination = listQuery.data?.pagination;

  return (
    <PageLayout title="Ordens de Servico" subtitle="OS de manutencao da frota" icon={Build}>
      <RdoFilterBar
        dataInicio={dataInicio} dataFim={dataFim}
        codparc={codparc} coddep={coddep} codfuncao={codfuncao}
        onUpdateParams={updateParams} onClearAll={clearAll}
        onOpenFilters={() => setDrawerOpen(true)}
        totalRegistros={resumoQuery.data?.totalOs}
        totalLabel="OS" isLoading={resumoQuery.isLoading}
      />

      <Stack spacing={2.5} sx={{ mt: 2 }}>
        <OsExtraFilters
          status={status} tipo={tipo} manutencao={manutencao}
          codparc={codparc} coddep={coddep}
          onUpdate={updateParams}
        />

        <OsKpiRow resumo={resumoQuery.data} isLoading={resumoQuery.isLoading} />

        <OsDataGrid
          rows={listQuery.data?.data ?? []}
          total={pagination?.total ?? 0}
          page={pagination?.page ?? 1}
          pageSize={pagination?.limit ?? 30}
          isLoading={listQuery.isLoading}
          onPageChange={handlePageChange}
        />

        {codparc && (
          <OsColabPanel
            servicos={colabQuery.data}
            isLoading={colabQuery.isLoading}
            codusu={codparc}
          />
        )}
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
