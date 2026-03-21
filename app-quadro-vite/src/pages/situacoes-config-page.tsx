import { useState, useMemo, useCallback, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Tooltip, Typography, Stack,
  Divider, Badge, Menu, ListItemText, InputAdornment, alpha,
} from '@mui/material';
import { Add, Edit, Delete, Search, ViewColumn, FilterList, FileDownload } from '@mui/icons-material';
import {
  DataGrid, type GridColDef,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv, ExportPrint,
  QuickFilter, QuickFilterControl, QuickFilterTrigger,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { useSituacoes, useCreateSituacao, useUpdateSituacao, useDeleteSituacao } from '@/hooks/use-hstvei';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import type { Situacao } from '@/types/hstvei-types';

// ── Styled QuickFilter ──
type OwnerState = { expanded: boolean };
const StyledQuickFilter = styled(QuickFilter)({ display: 'grid', alignItems: 'center' });
const StyledSearchTrigger = styled(ToolbarButton)<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({ gridArea: '1 / 1', width: 'min-content', height: 'min-content', zIndex: 1, opacity: ownerState.expanded ? 0 : 1, pointerEvents: ownerState.expanded ? 'none' : 'auto', transition: theme.transitions.create(['opacity']) }));
const StyledSearchField = styled(TextField)<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({ gridArea: '1 / 1', overflowX: 'clip', width: ownerState.expanded ? 200 : 'var(--trigger-width)', opacity: ownerState.expanded ? 1 : 0, transition: theme.transitions.create(['width', 'opacity']) }));

const DEPARTAMENTOS = [
  { cod: 1050000, nome: 'Manutencao' },
  { cod: 1020000, nome: 'Comercial' },
  { cod: 1090000, nome: 'Logistica' },
  { cod: 1140000, nome: 'Operacao' },
  { cod: 1070000, nome: 'Compras' },
];

const gridSx = {
  flex: 1, border: 0,
  '& .MuiDataGrid-columnHeaders': { '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12 } },
  '& .MuiDataGrid-row': { '&:hover': { bgcolor: (t: any) => alpha(t.palette.primary.main, 0.04) } },
  '& .MuiDataGrid-cell': { fontSize: 12, borderColor: 'divider' },
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
  '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' },
} as const;

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

  const openCreate = useCallback(() => { setEditingId(null); setForm(EMPTY_FORM); setDialogOpen(true); }, []);
  const openEdit = useCallback((row: Situacao) => { setEditingId(row.ID); setForm({ DESCRICAO: row.DESCRICAO, CODDEP: row.CODDEP, OBS: row.OBS ?? '' }); setDialogOpen(true); }, []);

  const handleSave = useCallback(() => {
    if (!form.DESCRICAO.trim() || !form.CODDEP) return;
    const payload = { DESCRICAO: form.DESCRICAO.trim(), CODDEP: form.CODDEP, OBS: form.OBS.trim() || undefined };
    if (editingId) { updateMut.mutate({ id: editingId, input: payload }, { onSuccess: () => setDialogOpen(false) }); }
    else { createMut.mutate(payload, { onSuccess: () => setDialogOpen(false) }); }
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
      field: 'actions', headerName: '', width: 80, sortable: false, filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title="Editar"><IconButton size="small" onClick={() => openEdit(row)}><Edit sx={{ fontSize: 16 }} /></IconButton></Tooltip>
          <Tooltip title="Excluir"><IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}><Delete sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ], [openEdit]);

  function SitToolbar() {
    const [exportOpen, setExportOpen] = useState(false);
    const exportRef = useRef<HTMLButtonElement>(null);
    return (
      <Toolbar>
        <Typography sx={{ fontSize: 14, fontWeight: 700, mr: 'auto' }}>Situacoes por Departamento</Typography>
        <Chip label={`${rows.length} registros`} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700 }} />
        <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Adicionar situacao"><IconButton size="small" color="primary" onClick={openCreate}><Add sx={{ fontSize: 18 }} /></IconButton></Tooltip>
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
      <DataGrid rows={rows} columns={columns} getRowId={(row) => row.ID}
        loading={isLoading} density="compact" disableRowSelectionOnClick showToolbar
        slots={{ toolbar: SitToolbar }} rowHeight={44}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        initialState={{ sorting: { sortModel: [{ field: 'ID', sort: 'asc' }] } }}
        sx={gridSx} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingId ? 'Editar Situacao' : 'Nova Situacao'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Descricao *" value={form.DESCRICAO} onChange={(e) => setForm((f) => ({ ...f, DESCRICAO: e.target.value }))} autoFocus />
          <TextField label="Departamento *" select value={form.CODDEP || ''} onChange={(e) => setForm((f) => ({ ...f, CODDEP: Number(e.target.value) }))}>
            {DEPARTAMENTOS.map((d) => {
              const info = getDepartamentoInfo(d.nome);
              return (<MenuItem key={d.cod} value={d.cod}><Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: info.color }} /><span>{d.nome}</span></Stack></MenuItem>);
            })}
          </TextField>
          <TextField label="Observacao" value={form.OBS} onChange={(e) => setForm((f) => ({ ...f, OBS: e.target.value }))} multiline minRows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.DESCRICAO.trim() || !form.CODDEP || createMut.isPending || updateMut.isPending}>
            {createMut.isPending || updateMut.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar exclusao</DialogTitle>
        <DialogContent><Typography>Deseja remover <strong>{deleteTarget?.DESCRICAO}</strong>?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteMut.isPending}>{deleteMut.isPending ? 'Removendo...' : 'Remover'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
