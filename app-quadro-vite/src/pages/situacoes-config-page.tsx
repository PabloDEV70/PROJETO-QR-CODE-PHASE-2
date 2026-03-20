import { useState, useMemo, useCallback } from 'react';
import {
  Box, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Tooltip, Typography, Stack,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import {
  DataGrid, type GridColDef,
  GridToolbarContainer, GridToolbarColumnsButton,
  GridToolbarFilterButton, GridToolbarExport, GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { useSituacoes, useCreateSituacao, useUpdateSituacao, useDeleteSituacao } from '@/hooks/use-hstvei';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import type { Situacao } from '@/types/hstvei-types';

const DEPARTAMENTOS = [
  { cod: 1050000, nome: 'Manutencao' },
  { cod: 1020000, nome: 'Comercial' },
  { cod: 1090000, nome: 'Logistica' },
  { cod: 1140000, nome: 'Operacao' },
  { cod: 1070000, nome: 'Compras' },
];

type FormData = { DESCRICAO: string; CODDEP: number; OBS: string };
const EMPTY_FORM: FormData = { DESCRICAO: '', CODDEP: 0, OBS: '' };

export function SituacoesConfigPage() {
  const { data: situacoes, isLoading } = useSituacoes();
  const createMut = useCreateSituacao();
  const updateMut = useUpdateSituacao();
  const deleteMut = useDeleteSituacao();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Situacao | null>(null);

  const rows = useMemo(() => situacoes ?? [], [situacoes]);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((row: Situacao) => {
    setEditingId(row.ID);
    setForm({ DESCRICAO: row.DESCRICAO, CODDEP: row.CODDEP, OBS: row.OBS ?? '' });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.DESCRICAO.trim() || !form.CODDEP) return;
    const payload = { DESCRICAO: form.DESCRICAO.trim(), CODDEP: form.CODDEP, OBS: form.OBS.trim() || undefined };
    if (editingId) {
      updateMut.mutate({ id: editingId, input: payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMut.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  }, [form, editingId, createMut, updateMut]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.ID, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, deleteMut]);

  const columns: GridColDef<Situacao>[] = useMemo(() => [
    { field: 'ID', headerName: 'ID', width: 70 },
    { field: 'DESCRICAO', headerName: 'Descricao', flex: 1, minWidth: 200 },
    {
      field: 'departamentoNome', headerName: 'Departamento', width: 180,
      renderCell: ({ row }) => {
        const info = getDepartamentoInfo(row.departamentoNome);
        const Icon = info.Icon;
        return <Chip icon={<Icon sx={{ fontSize: '14px !important' }} />} label={info.label} size="small" sx={{ bgcolor: info.bgLight, color: info.color, fontWeight: 600, fontSize: 11 }} />;
      },
    },
    { field: 'OBS', headerName: 'Observacao', flex: 1, minWidth: 200, valueGetter: (_v: unknown, row: Situacao) => row.OBS ?? '' },
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
        <Typography sx={{ fontWeight: 700, fontSize: 16, mr: 'auto' }}>Situacoes por Departamento</Typography>
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
        rows={rows} columns={columns} getRowId={(row) => row.ID}
        loading={isLoading} density="compact" disableRowSelectionOnClick
        slots={{ toolbar: CustomToolbar }}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        initialState={{ sorting: { sortModel: [{ field: 'ID', sort: 'asc' }] } }}
        sx={{ flex: 1, border: 'none', '& .MuiDataGrid-cell': { fontSize: 13 }, '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 13 } }}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingId ? 'Editar Situacao' : 'Nova Situacao'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Descricao *" value={form.DESCRICAO}
            onChange={(e) => setForm((f) => ({ ...f, DESCRICAO: e.target.value }))} autoFocus />
          <TextField label="Departamento *" select value={form.CODDEP || ''}
            onChange={(e) => setForm((f) => ({ ...f, CODDEP: Number(e.target.value) }))}>
            {DEPARTAMENTOS.map((d) => {
              const info = getDepartamentoInfo(d.nome);
              return (
                <MenuItem key={d.cod} value={d.cod}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: info.color }} />
                    <span>{d.nome}</span>
                  </Stack>
                </MenuItem>
              );
            })}
          </TextField>
          <TextField label="Observacao" value={form.OBS}
            onChange={(e) => setForm((f) => ({ ...f, OBS: e.target.value }))} multiline minRows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={!form.DESCRICAO.trim() || !form.CODDEP || createMut.isPending || updateMut.isPending}>
            {createMut.isPending || updateMut.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar exclusao</DialogTitle>
        <DialogContent>
          <Typography>Deseja remover a situacao <strong>{deleteTarget?.DESCRICAO}</strong>?</Typography>
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
