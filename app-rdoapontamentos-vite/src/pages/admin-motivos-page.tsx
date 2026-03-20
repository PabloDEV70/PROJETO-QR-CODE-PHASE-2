import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useMotivosGrid, useDeleteMotivo } from '@/hooks/use-motivos-crud';
import { useMotivosUrlParams } from '@/hooks/use-motivos-url-params';
import { MotivosDataGrid } from '@/components/rdoapontamentos/motivos-data-grid';
import { MotivoDeleteDialog } from '@/components/rdoapontamentos/motivo-delete-dialog';
import { useAuthStore } from '@/stores/auth-store';
import { ApiErrorBanner } from '@/components/shared/api-error-banner';
import type { RdoMotivo } from '@/types/rdo-types';

export function AdminMotivosPage() {
  const navigate = useNavigate();
  const isProd = useAuthStore((s) => s.database) === 'PROD';
  const {
    page, limit, ativo, params,
    sortModel, updateParams, handleSortModelChange,
  } = useMotivosUrlParams();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<RdoMotivo | null>(null);

  const gridQuery = useMotivosGrid(params);
  const deleteMut = useDeleteMotivo();

  const rows = gridQuery.data?.data ?? [];
  const total = gridQuery.data?.meta?.total ?? 0;

  const handleEdit = useCallback((motivo: RdoMotivo) => {
    navigate(`/admin/motivo/${motivo.RDOMOTIVOCOD}`);
  }, [navigate]);

  const handleDelete = useCallback((motivo: RdoMotivo) => {
    setSelected(motivo); setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!selected) return;
    deleteMut.mutate(selected.RDOMOTIVOCOD, {
      onSuccess: () => { setDeleteOpen(false); setSelected(null); },
    });
  }, [selected, deleteMut]);

  return (
    <Box sx={{ p: 2 }}>
      <ApiErrorBanner error={gridQuery.error} onRetry={() => gridQuery.refetch()} context="AdminMotivos" />
      <MotivosDataGrid
        rows={rows}
        loading={gridQuery.isLoading}
        rowCount={total}
        paginationModel={{ page, pageSize: limit }}
        onPaginationModelChange={(m) =>
          updateParams({ page: String(m.page), limit: String(m.pageSize) })
        }
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => navigate('/admin/motivo/novo')}
        onRefresh={() => gridQuery.refetch()}
        ativo={ativo}
        onAtivoChange={(v) => updateParams({ ativo: v || undefined, page: '0' })}
      />
      <MotivoDeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={handleDeleteConfirm}
        loading={deleteMut.isPending}
        motivo={selected}
        isProd={isProd}
      />
    </Box>
  );
}

export default AdminMotivosPage;
