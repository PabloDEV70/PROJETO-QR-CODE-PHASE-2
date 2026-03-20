import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { RdoStatsCards } from '@/components/rdoapontamentos/rdo-stats-cards';
import { RdoAdminDataGrid } from '@/components/rdoapontamentos/rdo-data-grid';
import { RdoDeleteDialog } from '@/components/rdoapontamentos/rdo-delete-dialog';
import { useAllRdos } from '@/hooks/use-admin-rdos';
import { useAdminUrlParams } from '@/hooks/use-admin-url-params';
import { ApiErrorBanner } from '@/components/shared/api-error-banner';
import { getPeriodPresets, getActivePresetKey } from '@/utils/rdo-filter-helpers';
import type { RdoCabecalho } from '@/types/rdo-types';

export function AdminRdosPage() {
  const navigate = useNavigate();
  const {
    dataInicio, dataFim, page, limit,
    sortModel, listParams, updateParams, handlePagination, handleSortModelChange,
  } = useAdminUrlParams();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<RdoCabecalho | null>(null);

  const listQuery = useAllRdos(listParams);

  const presets = useMemo(() => getPeriodPresets(), []);
  const activePreset = useMemo(
    () => getActivePresetKey(dataInicio, dataFim), [dataInicio, dataFim],
  );

  const handlePresetChange = useCallback((key: string) => {
    if (key === '__all') {
      updateParams({ dataInicio: null, dataFim: null });
      return;
    }
    if (key === '__custom') return;
    const preset = presets.find((p) => p.key === key);
    if (preset) updateParams({ dataInicio: preset.ini, dataFim: preset.fim });
  }, [presets, updateParams]);

  const selectValue = activePreset ?? (dataInicio || dataFim ? '__custom' : '__all');

  const handleAdd = useCallback(() => {
    navigate('/admin/rdo/novo');
  }, [navigate]);

  const handleEdit = useCallback((rdo: RdoCabecalho) => {
    navigate(`/admin/rdo/${rdo.CODRDO}`);
  }, [navigate]);

  const handleDelete = useCallback((rdo: RdoCabecalho) => {
    setSelected(rdo);
    setDeleteOpen(true);
  }, []);

  const dateFilters = (
    <Stack direction="row" spacing={1} alignItems="center">
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select
          value={selectValue}
          onChange={(e) => handlePresetChange(e.target.value)}
          sx={{ fontWeight: 600, fontSize: 13, height: 32, borderRadius: 2 }}
        >
          {presets.map((p) => (
            <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>
          ))}
          <MenuItem value="__all">Tudo</MenuItem>
          {selectValue === '__custom' && (
            <MenuItem value="__custom">Personalizado</MenuItem>
          )}
        </Select>
      </FormControl>
      <TextField
        type="date"
        size="small"
        value={dataInicio}
        onChange={(e) => updateParams({ dataInicio: e.target.value })}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ width: 140 }}
      />
      <TextField
        type="date"
        size="small"
        value={dataFim}
        onChange={(e) => updateParams({ dataFim: e.target.value })}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ width: 140 }}
      />
    </Stack>
  );

  return (
    <Box sx={{ p: 2 }}>
      <ApiErrorBanner error={listQuery.error} onRetry={() => listQuery.refetch()} context="AdminRdos" />
      <RdoStatsCards
        dataInicio={dataInicio || undefined}
        dataFim={dataFim || undefined}
      />
      <RdoAdminDataGrid
        rows={listQuery.data?.data ?? []}
        loading={listQuery.isLoading}
        total={listQuery.data?.meta?.total ?? 0}
        paginationModel={{ page, pageSize: limit }}
        onPaginationModelChange={handlePagination}
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        onRefresh={() => listQuery.refetch()}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        dataInicio={dataInicio}
        onDataInicioChange={(v) => updateParams({ dataInicio: v })}
        dataFim={dataFim}
        onDataFimChange={(v) => updateParams({ dataFim: v })}
        extraDateFilters={dateFilters}
      />

      <RdoDeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        rdo={selected}
      />
    </Box>
  );
}

export default AdminRdosPage;
