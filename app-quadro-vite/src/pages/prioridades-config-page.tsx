import { useState, useMemo, useCallback, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Tooltip, Typography, Stack,
  Divider, Badge, Menu, MenuItem, ListItemText, InputAdornment, alpha,
} from '@mui/material';
import { Add, Edit, Delete, Search, ViewColumn, FilterList, FileDownload, FiberManualRecord } from '@mui/icons-material';
import {
  DataGrid, type GridColDef,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv, ExportPrint,
  QuickFilter, QuickFilterControl, QuickFilterTrigger,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { usePrioridades, useCreatePrioridade, useUpdatePrioridade, useDeletePrioridade } from '@/hooks/use-hstvei';
import type { Prioridade } from '@/types/hstvei-types';

// ── Styled QuickFilter ──
type OwnerState = { expanded: boolean };
const StyledQuickFilter = styled(QuickFilter)({ display: 'grid', alignItems: 'center' });
const StyledSearchTrigger = styled(ToolbarButton)<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({ gridArea: '1 / 1', width: 'min-content', height: 'min-content', zIndex: 1, opacity: ownerState.expanded ? 0 : 1, pointerEvents: ownerState.expanded ? 'none' : 'auto', transition: theme.transitions.create(['opacity']) }));
const StyledSearchField = styled(TextField)<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({ gridArea: '1 / 1', overflowX: 'clip', width: ownerState.expanded ? 200 : 'var(--trigger-width)', opacity: ownerState.expanded ? 1 : 0, transition: theme.transitions.create(['width', 'opacity']) }));

const PRI_COLORS: Record<number, string> = { 0: '#d32f2f', 1: '#ed6c02', 2: '#2e7d32', 3: '#9e9e9e' };

const gridSx = {
  flex: 1, border: 0,
  '& .MuiDataGrid-columnHeaders': { '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12 } },
  '& .MuiDataGrid-row': { '&:hover': { bgcolor: (t: any) => alpha(t.palette.primary.main, 0.04) } },
  '& .MuiDataGrid-cell': { fontSize: 12, borderColor: 'divider' },
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
  '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' },
} as const;

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

  const openCreate = useCallback(() => { setEditingId(null); setForm(EMPTY_FORM); setDialogOpen(true); }, []);
  const openEdit = useCallback((row: Prioridade) => { setEditingId(row.IDPRI); setForm({ IDPRI: row.IDPRI, SIGLA: row.SIGLA, DESCRICAO: row.DESCRICAO }); setDialogOpen(true); }, []);

  const handleSave = useCallback(() => {
    if (!form.SIGLA.trim() || !form.DESCRICAO.trim()) return;
    if (editingId !== null) { updateMut.mutate({ idpri: editingId, input: { SIGLA: form.SIGLA.trim(), DESCRICAO: form.DESCRICAO.trim() } }, { onSuccess: () => setDialogOpen(false) }); }
    else { if (form.IDPRI === '') return; createMut.mutate({ IDPRI: form.IDPRI as number, SIGLA: form.SIGLA.trim(), DESCRICAO: form.DESCRICAO.trim() }, { onSuccess: () => setDialogOpen(false) }); }
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
        <Chip icon={<FiberManualRecord sx={{ fontSize: '10px !important', color: `${PRI_COLORS[row.IDPRI] ?? '#999'} !important` }} />}
          label={row.SIGLA} size="small" sx={{ fontWeight: 700, fontSize: 12, height: 24, minWidth: 70 }} />
      ),
    },
    { field: 'DESCRICAO', headerName: 'Descricao', flex: 1, minWidth: 200 },
    {
      field: 'actions', headerName: '', width: 80, sortable: false, filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title="Editar"><IconButton size="small" onClick={() => openEdit(row)}><Edit sx={{ fontSize: 16 }} /></IconButton></Tooltip>
          <Tooltip title="Excluir"><IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}><Delete sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ], [openEdit]);

  function PriToolbar() {
    const [exportOpen, setExportOpen] = useState(false);
    const exportRef = useRef<HTMLButtonElement>(null);
    return (
      <Toolbar>
        <Typography sx={{ fontSize: 14, fontWeight: 700, mr: 'auto' }}>Prioridades</Typography>
        <Chip label={`${rows.length} registros`} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700 }} />
        <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Adicionar prioridade"><IconButton size="small" color="primary" onClick={openCreate}><Add sx={{ fontSize: 18 }} /></IconButton></Tooltip>
        <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Colunas"><ColumnsPanelTrigger render={<ToolbarButton />}><ViewColumn fontSize="small" /></ColumnsPanelTrigger></Tooltip>
        <Tooltip title="Filtros"><FilterPanelTrigger render={(fp, state) => (<ToolbarButton {...fp} color="default"><Badge badgeContent={state.filterCount} color="primary" variant="dot"><FilterList fontSize="small" /></Badge></ToolbarButton>)} /></Tooltip>
        <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Exportar"><ToolbarButton ref={exportRef} onClick={() => setExportOpen(true)}><FileDownload fontSize="small" /></ToolbarButton></Tooltip>
        <Menu anchorEl={exportRef.current} open={exportOpen} onClose={() => setExportOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <ExportPrint render={<MenuItem />} onClick={() => setExportOpen(false)}><ListItemText>Imprimir</ListItemText></ExportPrint>
          <ExportCsv render={<MenuItem />} onClick={() => setExportOpen(false)}><ListItemText>Baixar CSV</ListItemText></ExportCsv>
        </Menu>
        <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
        <StyledQuickFilter>
          <QuickFilterTrigger render={(triggerProps, state) => (<Tooltip title="Buscar"><StyledSearchTrigger {...triggerProps} ownerState={{ expanded: state.expanded }} color="default"><Search fontSize="small" /></StyledSearchTrigger></Tooltip>)} />
          <QuickFilterControl render={({ ref, ...controlProps }, state) => (<StyledSearchField {...controlProps} ownerState={{ expanded: state.expanded }} inputRef={ref} placeholder="Buscar..." size="small" slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }} />)} />
        </StyledQuickFilter>
      </Toolbar>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <DataGrid rows={rows} columns={columns} getRowId={(row) => row.IDPRI}
        loading={isLoading} density="compact" disableRowSelectionOnClick showToolbar
        slots={{ toolbar: PriToolbar }} rowHeight={44}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        initialState={{ sorting: { sortModel: [{ field: 'IDPRI', sort: 'asc' }] } }}
        sx={gridSx} />

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

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar exclusao</DialogTitle>
        <DialogContent><Typography>Deseja remover <strong>{deleteTarget?.SIGLA} — {deleteTarget?.DESCRICAO}</strong>?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteMut.isPending}>{deleteMut.isPending ? 'Removendo...' : 'Remover'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
