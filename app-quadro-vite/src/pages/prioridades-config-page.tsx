import { useState, useMemo, useCallback } from 'react';
import {
  Box, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Tooltip, Typography, Stack,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import {
  DataGrid, type GridColDef,
  GridToolbarContainer, GridToolbarColumnsButton,
  GridToolbarFilterButton, GridToolbarExport, GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { usePrioridades, useCreatePrioridade, useUpdatePrioridade, useDeletePrioridade } from '@/hooks/use-hstvei';
import type { Prioridade } from '@/types/hstvei-types';

const PRI_COLORS: Record<number, string> = { 0: '#d32f2f', 1: '#ed6c02', 2: '#2e7d32', 3: '#9e9e9e' };

type FormData = { IDPRI: number | ''; SIGLA: string; DESCRICAO: string };
const EMPTY_FORM: FormData = { IDPRI: '', SIGLA: '', DESCRICAO: '' };

export function PrioridadesConfigPage() {
  const { data: prioridades, isLoading } = usePrioridades();
  const createMut = useCreatePrioridade();
  const updateMut = useUpdatePrioridade();
  const deleteMut = useDeletePrioridade();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Prioridade | null>(null);

  const rows = useMemo(() => prioridades ?? [], [prioridades]);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((row: Prioridade) => {
    setEditingId(row.IDPRI);
    setForm({ IDPRI: row.IDPRI, SIGLA: row.SIGLA, DESCRICAO: row.DESCRICAO });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.SIGLA.trim() || !form.DESCRICAO.trim()) return;
    if (editingId !== null) {
      updateMut.mutate({ idpri: editingId, input: { SIGLA: form.SIGLA.trim(), DESCRICAO: form.DESCRICAO.trim() } }, { onSuccess: () => setDialogOpen(false) });
    } else {
      if (form.IDPRI === '') return;
      createMut.mutate({ IDPRI: form.IDPRI as number, SIGLA: form.SIGLA.trim(), DESCRICAO: form.DESCRICAO.trim() }, { onSuccess: () => setDialogOpen(false) });
    }
  }, [form, editingId, createMut, updateMut]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.IDPRI, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, deleteMut]);

  const columns: GridColDef<Prioridade>[] = useMemo(() => [
    { field: 'IDPRI', headerName: 'ID', width: 70 },
    {
      field: 'SIGLA', headerName: 'Sigla', width: 120,
      renderCell: ({ row }) => (
        <Chip label={row.SIGLA} size="small" sx={{ fontWeight: 700, fontSize: 12, bgcolor: `${PRI_COLORS[row.IDPRI] ?? '#999'}18`, color: PRI_COLORS[row.IDPRI] ?? '#999', minWidth: 60 }} />
      ),
    },
    { field: 'DESCRICAO', headerName: 'Descricao', flex: 1, minWidth: 200 },
    {
      field: 'actions', headerName: 'Acoes', width: 100, sortable: false, filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => openEdit(row)}><Edit fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}><Delete fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [openEdit]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer sx={{ px: 2, py: 1, gap: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, mr: 'auto' }}>Prioridades</Typography>
        <GridToolbarQuickFilter />
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport />
        <Button variant="contained" size="small" startIcon={<Add />} onClick={openCreate}>
          Adicionar
        </Button>
      </GridToolbarContainer>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        rows={rows} columns={columns} getRowId={(row) => row.IDPRI}
        loading={isLoading} density="compact" disableRowSelectionOnClick
        showToolbar slots={{ toolbar: CustomToolbar }}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        initialState={{ sorting: { sortModel: [{ field: 'IDPRI', sort: 'asc' }] } }}
        sx={{ flex: 1, border: 'none', '& .MuiDataGrid-cell': { fontSize: 13 }, '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 13 } }}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingId !== null ? 'Editar Prioridade' : 'Nova Prioridade'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="ID (IDPRI) *" type="number" value={form.IDPRI}
            onChange={(e) => setForm((f) => ({ ...f, IDPRI: e.target.value === '' ? '' : Number(e.target.value) }))}
            disabled={editingId !== null} />
          <TextField label="Sigla *" value={form.SIGLA}
            onChange={(e) => setForm((f) => ({ ...f, SIGLA: e.target.value }))}
            inputProps={{ maxLength: 5 }} autoFocus={editingId !== null} />
          <TextField label="Descricao *" value={form.DESCRICAO}
            onChange={(e) => setForm((f) => ({ ...f, DESCRICAO: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={!form.SIGLA.trim() || !form.DESCRICAO.trim() || (editingId === null && form.IDPRI === '') || createMut.isPending || updateMut.isPending}>
            {createMut.isPending || updateMut.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar exclusao</DialogTitle>
        <DialogContent>
          <Typography>Deseja remover a prioridade <strong>{deleteTarget?.SIGLA} — {deleteTarget?.DESCRICAO}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteMut.isPending}>
            {deleteMut.isPending ? 'Removendo...' : 'Remover'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
