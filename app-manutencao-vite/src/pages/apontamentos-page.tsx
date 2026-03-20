import { useMemo, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import type { GridSortModel, GridPaginationModel } from '@mui/x-data-grid';
import { ApontamentoDataGrid } from '@/components/apontamento/apontamento-data-grid';
import { ApontamentoFormDialog } from '@/components/apontamento/apontamento-form-dialog';
import { ApontamentoDeleteDialog } from '@/components/apontamento/apontamento-delete-dialog';
import { useApontamentosList, useCreateApontamento, useUpdateApontamento, useDeleteApontamento } from '@/hooks/use-apontamentos';
import { useAuthStore } from '@/stores/auth-store';
import type { ApontamentoListItem, ApontamentoListParams, ApontamentoFormData } from '@/types/apontamento-types';

export function ApontamentosPage() {
  const [sp, setSp] = useSearchParams();
  const isProd = useAuthStore((s) => s.database) === 'PROD';

  const page = Number(sp.get('page')) || 1;
  const limit = Number(sp.get('limit')) || 25;
  const orderBy = sp.get('orderBy') || 'CODIGO';
  const orderDir = (sp.get('orderDir') || 'DESC') as 'ASC' | 'DESC';
  const statusOs = sp.get('statusOs') || '';
  const dtInicio = sp.get('dtInicio') || '';
  const dtFim = sp.get('dtFim') || '';

  const params: ApontamentoListParams = useMemo(() => ({
    page, limit, orderBy, orderDir,
    statusOs: statusOs || undefined,
    dtInicio: dtInicio || undefined,
    dtFim: dtFim || undefined,
  }), [page, limit, orderBy, orderDir, statusOs, dtInicio, dtFim]);

  const { data, isLoading, refetch } = useApontamentosList(params);
  const createMut = useCreateApontamento();
  const updateMut = useUpdateApontamento();
  const deleteMut = useDeleteApontamento();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApontamentoListItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ApontamentoListItem | null>(null);

  const update = useCallback((patch: Record<string, string | null>) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === '') next.delete(k); else next.set(k, v);
      }
      return next;
    }, { replace: true });
  }, [setSp]);

  const handlePaginationChange = useCallback((m: GridPaginationModel) => {
    update({ page: String(m.page + 1), limit: String(m.pageSize) });
  }, [update]);

  const handleSortChange = useCallback((m: GridSortModel) => {
    if (m.length > 0 && m[0]?.sort) {
      update({ orderBy: m[0].field, orderDir: m[0].sort === 'asc' ? 'ASC' : 'DESC' });
    }
  }, [update]);

  const handleStatusChange = useCallback((s: string) => {
    update({ statusOs: s || null, page: '1' });
  }, [update]);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((row: ApontamentoListItem) => {
    setEditingItem(row);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((row: ApontamentoListItem) => {
    setDeletingItem(row);
    setDeleteOpen(true);
  }, []);

  const handleFormSubmit = useCallback((formData: ApontamentoFormData) => {
    const onSuccess = () => { setFormOpen(false); setEditingItem(null); };
    if (editingItem) {
      updateMut.mutate([editingItem.CODIGO, formData], { onSuccess });
    } else {
      createMut.mutate([formData], { onSuccess });
    }
  }, [editingItem, createMut, updateMut]);

  const handleConfirmDelete = useCallback(() => {
    if (!deletingItem) return;
    deleteMut.mutate([deletingItem.CODIGO], {
      onSuccess: () => { setDeleteOpen(false); setDeletingItem(null); },
    });
  }, [deletingItem, deleteMut]);

  const paginationModel: GridPaginationModel = { page: page - 1, pageSize: limit };
  const sortModel: GridSortModel = orderBy
    ? [{ field: orderBy, sort: orderDir === 'ASC' ? 'asc' : 'desc' }]
    : [];

  return (
    <Box>
      <ApontamentoDataGrid
        rows={data?.data ?? []}
        rowCount={data?.total ?? 0}
        isLoading={isLoading}
        paginationModel={paginationModel}
        sortModel={sortModel}
        onPaginationModelChange={handlePaginationChange}
        onSortModelChange={handleSortChange}
        onRefresh={() => refetch()}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        statusOs={statusOs}
        onStatusChange={handleStatusChange}
        isProd={isProd}
      />

      <ApontamentoFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingItem(null); }}
        onSubmit={handleFormSubmit}
        loading={createMut.isPending || updateMut.isPending}
        isProd={isProd}
        editingItem={editingItem}
      />

      <ApontamentoDeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeletingItem(null); }}
        onConfirm={handleConfirmDelete}
        loading={deleteMut.isPending}
        isProd={isProd}
        item={deletingItem}
      />
    </Box>
  );
}
