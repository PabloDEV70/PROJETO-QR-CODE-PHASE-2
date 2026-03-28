import { Box } from '@mui/material';
import { useCorridasUrlParams } from '@/hooks/use-corridas-url-params';
import { CorridasDataGrid } from '@/components/corridas/corridas-data-grid';
import { CorridaDrawer } from '@/components/corridas/corrida-drawer';
import { CorridaFormDrawer } from '@/components/corridas/corrida-form-drawer';
import { useCorridasList, useUpdateCorridaStatus } from '@/hooks/use-corridas';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function CorridasPage() {
  const { params, setParam, setParams, clearFilters, activeFilterCount } = useCorridasUrlParams();
  const qc = useQueryClient();

  const listParams = {
    page: params.page + 1,
    limit: params.limit,
    ...(params.status && { status: params.status }),
    ...(params.motorista && { motorista: Number(params.motorista) }),
    ...(params.solicitante && { solicitante: Number(params.solicitante) }),
    ...(params.codparc && { codparc: Number(params.codparc) }),
    ...(params.buscarLevar && { buscarLevar: params.buscarLevar }),
    ...(params.dataInicio && { dataInicio: params.dataInicio }),
    ...(params.dataFim && { dataFim: params.dataFim }),
    ...(params.search && { search: params.search }),
    orderBy: params.sortField,
    orderDir: params.sortDir,
  };

  const { data: listData, isLoading } = useCorridasList(listParams);
  const statusMutation = useUpdateCorridaStatus();

  const handleConcluir = useCallback((id: number) => {
    statusMutation.mutate({ id, status: '2' });
  }, [statusMutation]);

  const handleEditRow = useCallback((id: number) => {
    setParams({ corrida: id, form: 'edit' });
  }, [setParams]);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <CorridasDataGrid
        rows={listData?.data ?? []}
        total={listData?.total ?? 0}
        loading={isLoading}
        page={params.page}
        pageSize={params.limit}
        onPageChange={(p) => setParam('page', p)}
        onPageSizeChange={(s) => setParams({ limit: s, page: 0 })}
        onRowClick={(id) => setParam('corrida', id)}
        statusFilter={params.status}
        onStatusFilter={(s) => setParams({ status: s, page: 0 })}
        sortField={params.sortField}
        sortDir={params.sortDir}
        onSortChange={(field, dir) => setParams({ sortField: field, sortDir: dir, page: 0 })}
        dataInicio={params.dataInicio}
        dataFim={params.dataFim}
        onDataInicioChange={(v) => setParams({ dataInicio: v, page: 0 })}
        onDataFimChange={(v) => setParams({ dataFim: v, page: 0 })}
        motorista={params.motorista}
        onMotoristaChange={(v) => setParams({ motorista: v, page: 0 })}
        buscarLevar={params.buscarLevar}
        onBuscarLevarChange={(v) => setParams({ buscarLevar: v, page: 0 })}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
        onRefresh={() => qc.invalidateQueries({ queryKey: ['corridas'] })}
        onAdd={() => setParam('form', 'novo')}
        onConcluir={handleConcluir}
        onEditRow={handleEditRow}
      />

      <CorridaDrawer
        corridaId={params.corrida}
        open={params.corrida !== null && !params.form}
        onClose={() => setParam('corrida', null)}
        onEdit={(id) => setParams({ corrida: id, form: 'edit' })}
      />

      <CorridaFormDrawer
        open={!!params.form}
        mode={params.form === 'edit' ? 'edit' : 'create'}
        corridaId={params.form === 'edit' ? params.corrida : null}
        onClose={() => setParams({ form: '', corrida: params.form === 'novo' ? null : params.corrida })}
      />
    </Box>
  );
}
export default CorridasPage;
