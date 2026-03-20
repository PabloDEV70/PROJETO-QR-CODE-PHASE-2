import { useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box, Typography, Chip, Stack, TextField, InputAdornment,
  Tooltip, Divider, Badge, Menu, MenuItem, ListItemText,
  ToggleButtonGroup, ToggleButton, alpha, IconButton,
} from '@mui/material';
import {
  Search, Edit, Warning, ViewColumn, FilterList, FileDownload,
  FiberManualRecord,
} from '@mui/icons-material';
import {
  DataGrid, type GridColDef,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv, ExportPrint,
  QuickFilter, QuickFilterControl, QuickFilterTrigger,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { useHstVeiPainel } from '@/hooks/use-hstvei';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import type { PainelVeiculo } from '@/types/hstvei-types';

// ── Helpers ──

const PRI_COLORS: Record<string, string> = { URG: '#f44336', ALT: '#ff9800', NOR: '#4caf50', BAI: '#9e9e9e' };
const DEP_OPTIONS = ['Todos', 'Manutencao', 'Comercial', 'Logistica', 'Operacao', 'Compras'] as const;

function fmtDate(val: string | null | undefined): string {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('pt-BR');
}

function isOverdue(val: string | null | undefined): boolean {
  if (!val) return false;
  return new Date(val) < new Date();
}

// ── Flat row for DataGrid ──

interface QuadroRow {
  id: number;
  placa: string;
  tag: string;
  marcaModelo: string;
  tipo: string;
  situacao: string;
  departamento: string;
  prioridadeSigla: string;
  prioridadeDescricao: string;
  cliente: string;
  equipe: string;
  dtinicio: string | null;
  dtprevisao: string | null;
  situacaoId: number | null;
  codveiculo: number;
}

function buildRows(veiculos: PainelVeiculo[]): QuadroRow[] {
  return veiculos.map((v) => {
    const sit = v.situacoesAtivas?.[0];
    const ops = sit?.operadores?.map((o) => o.nome?.split(' ')[0]).join(', ') ?? '';
    const mecs = sit?.mecanicos?.map((m) => m.nome?.split(' ')[0]).join(', ') ?? '';
    const equipe = [ops, mecs].filter(Boolean).join(' | ');
    return {
      id: v.codveiculo,
      placa: v.placa ?? '-',
      tag: v.tag ?? '',
      marcaModelo: v.marcaModelo ?? '',
      tipo: v.tipo ?? '',
      situacao: sit?.situacao ?? '-',
      departamento: sit?.departamento ?? '-',
      prioridadeSigla: sit?.prioridadeSigla ?? '-',
      prioridadeDescricao: sit?.prioridadeDescricao ?? '',
      cliente: sit?.nomeParc ?? '',
      equipe,
      dtinicio: sit?.dtinicio ?? null,
      dtprevisao: sit?.dtprevisao ?? null,
      situacaoId: sit?.id ?? null,
      codveiculo: v.codveiculo,
    };
  });
}

// ── Styled QuickFilter ──

type OwnerState = { expanded: boolean };
const StyledQuickFilter = styled(QuickFilter)({ display: 'grid', alignItems: 'center' });
const StyledSearchTrigger = styled(ToolbarButton)<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({
  gridArea: '1 / 1', width: 'min-content', height: 'min-content', zIndex: 1,
  opacity: ownerState.expanded ? 0 : 1, pointerEvents: ownerState.expanded ? 'none' : 'auto',
  transition: theme.transitions.create(['opacity']),
}));
const StyledSearchField = styled(TextField)<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({
  gridArea: '1 / 1', overflowX: 'clip',
  width: ownerState.expanded ? 220 : 'var(--trigger-width)',
  opacity: ownerState.expanded ? 1 : 0,
  transition: theme.transitions.create(['width', 'opacity']),
}));

const TOGGLE_SX = {
  height: 28,
  '& .MuiToggleButton-root': {
    textTransform: 'none' as const, fontSize: 11, fontWeight: 600, px: 1.2, py: 0,
  },
};

// ── Toolbar ──

interface QuadroToolbarProps {
  dep: string;
  onDepChange: (v: string) => void;
  totalVeiculos: number;
  totalSituacoes: number;
}

function QuadroToolbar({ dep, onDepChange, totalVeiculos, totalSituacoes }: QuadroToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLButtonElement>(null);

  return (
    <Toolbar>
      <Typography fontWeight={700} fontSize={14} sx={{ mr: 1 }}>Quadro de Veiculos</Typography>
      <Chip label={`${totalVeiculos} veiculos`} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, mr: 0.5 }} />
      <Chip label={`${totalSituacoes} situacoes`} size="small" variant="outlined" sx={{ height: 22, fontSize: 10, mr: 0.5 }} />

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      <ToggleButtonGroup value={dep} exclusive onChange={(_, v) => { if (v) onDepChange(v); }} size="small" sx={TOGGLE_SX}>
        {DEP_OPTIONS.map((d) => {
          const info = d === 'Todos' ? null : getDepartamentoInfo(d);
          return (
            <ToggleButton key={d} value={d} sx={info ? {
              '&.Mui-selected': { bgcolor: alpha(info.color, 0.12), color: info.color, '&:hover': { bgcolor: alpha(info.color, 0.18) } },
            } : undefined}>
              {d}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>

      <div style={{ flex: 1 }} />

      <Tooltip title="Colunas"><ColumnsPanelTrigger render={<ToolbarButton />}><ViewColumn fontSize="small" /></ColumnsPanelTrigger></Tooltip>
      <Tooltip title="Filtros avancados">
        <FilterPanelTrigger render={(fp, state) => (
          <ToolbarButton {...fp} color="default"><Badge badgeContent={state.filterCount} color="primary" variant="dot"><FilterList fontSize="small" /></Badge></ToolbarButton>
        )} />
      </Tooltip>
      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
      <Tooltip title="Exportar"><ToolbarButton ref={exportRef} onClick={() => setExportOpen(true)}><FileDownload fontSize="small" /></ToolbarButton></Tooltip>
      <Menu anchorEl={exportRef.current} open={exportOpen} onClose={() => setExportOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <ExportPrint render={<MenuItem />} onClick={() => setExportOpen(false)}><ListItemText>Imprimir</ListItemText></ExportPrint>
        <ExportCsv render={<MenuItem />} onClick={() => setExportOpen(false)}><ListItemText>Baixar CSV</ListItemText></ExportCsv>
      </Menu>
      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
      <StyledQuickFilter>
        <QuickFilterTrigger render={(triggerProps, state) => (
          <Tooltip title="Buscar"><StyledSearchTrigger {...triggerProps} ownerState={{ expanded: state.expanded }} color="default"><Search fontSize="small" /></StyledSearchTrigger></Tooltip>
        )} />
        <QuickFilterControl render={({ ref, ...controlProps }, state) => (
          <StyledSearchField {...controlProps} ownerState={{ expanded: state.expanded }} inputRef={ref}
            placeholder="Placa, tag, cliente..." size="small"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }} />
        )} />
      </StyledQuickFilter>
    </Toolbar>
  );
}

// ── Grid styles ──

const LOCALE = {
  ...ptBR.components.MuiDataGrid.defaultProps.localeText,
  noRowsLabel: 'Nenhum veiculo encontrado',
};

const gridSx = {
  flex: 1, border: 0,
  '& .MuiDataGrid-columnHeaders': { '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12 } },
  '& .MuiDataGrid-row': { cursor: 'pointer', '&:hover': { bgcolor: (t: any) => alpha(t.palette.primary.main, 0.05) } },
  '& .MuiDataGrid-cell': { fontSize: 12, borderColor: 'divider' },
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
} as const;

// ── Page ──

export function QuadroPage() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const dep = sp.get('dep') || 'Todos';

  const setDep = useCallback((v: string) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      if (v === 'Todos') next.delete('dep'); else next.set('dep', v);
      return next;
    }, { replace: true });
  }, [setSp]);

  const { data, isLoading } = useHstVeiPainel();
  const allRows = useMemo(() => buildRows(data?.veiculos ?? []), [data]);

  const filteredRows = useMemo(() => {
    if (dep === 'Todos') return allRows;
    return allRows.filter((r) => r.departamento.toLowerCase().includes(dep.toLowerCase()));
  }, [allRows, dep]);

  const columns: GridColDef<QuadroRow>[] = useMemo(() => [
    {
      field: 'placa', headerName: 'Placa', width: 100,
      renderCell: ({ value }) => <Typography sx={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>{value}</Typography>,
    },
    { field: 'tag', headerName: 'Tag', width: 90 },
    { field: 'marcaModelo', headerName: 'Marca / Modelo', flex: 1, minWidth: 180 },
    { field: 'tipo', headerName: 'Tipo', width: 120 },
    {
      field: 'situacao', headerName: 'Situacao', width: 150,
      renderCell: ({ row }) => {
        const info = getDepartamentoInfo(row.departamento);
        return <Chip label={row.situacao} size="small" sx={{ fontSize: 10, fontWeight: 600, height: 22, bgcolor: info.bgLight, color: info.color }} />;
      },
    },
    {
      field: 'departamento', headerName: 'Departamento', width: 130,
      renderCell: ({ value }) => {
        const info = getDepartamentoInfo(value as string);
        const Icon = info.Icon;
        return <Chip icon={<Icon sx={{ fontSize: '14px !important' }} />} label={info.label} size="small" sx={{ fontSize: 10, height: 22, bgcolor: info.bgLight, color: info.color }} />;
      },
    },
    {
      field: 'prioridadeSigla', headerName: 'Prior.', width: 80, align: 'center', headerAlign: 'center',
      renderCell: ({ row }) => (
        <Tooltip title={row.prioridadeDescricao}>
          <Chip icon={<FiberManualRecord sx={{ fontSize: '10px !important', color: `${PRI_COLORS[row.prioridadeSigla] ?? '#9e9e9e'} !important` }} />}
            label={row.prioridadeSigla} size="small" variant="outlined"
            sx={{ fontSize: 10, height: 22, fontWeight: 700 }} />
        </Tooltip>
      ),
    },
    { field: 'cliente', headerName: 'Cliente', flex: 1, minWidth: 160 },
    { field: 'equipe', headerName: 'Equipe', width: 150 },
    {
      field: 'dtinicio', headerName: 'Inicio', width: 95,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11 }}>{fmtDate(value as string)}</Typography>,
    },
    {
      field: 'dtprevisao', headerName: 'Previsao', width: 110,
      renderCell: ({ value }) => {
        const overdue = isOverdue(value as string);
        return (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography sx={{ fontSize: 11, color: overdue ? 'error.main' : 'text.primary', fontWeight: overdue ? 700 : 400 }}>
              {fmtDate(value as string)}
            </Typography>
            {overdue && <Warning sx={{ fontSize: 14, color: 'error.main' }} />}
          </Stack>
        );
      },
    },
    {
      field: 'actions', headerName: '', width: 50, sortable: false, filterable: false,
      renderCell: ({ row }) => row.situacaoId ? (
        <Tooltip title="Editar situacao">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/situacao/${row.situacaoId}`); }}>
            <Edit sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      ) : null,
    },
  ], [navigate]);

  const toolbarProps: QuadroToolbarProps = useMemo(() => ({
    dep,
    onDepChange: setDep,
    totalVeiculos: filteredRows.length,
    totalSituacoes: data?.totalSituacoesAtivas ?? 0,
  }), [dep, setDep, filteredRows.length, data]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <DataGrid
        rows={filteredRows}
        columns={columns}
        loading={isLoading}
        density="compact"
        rowHeight={44}
        disableRowSelectionOnClick
        showToolbar
        slots={{
          toolbar: () => (
            <QuadroToolbar
              dep={toolbarProps.dep}
              onDepChange={toolbarProps.onDepChange}
              totalVeiculos={toolbarProps.totalVeiculos}
              totalSituacoes={toolbarProps.totalSituacoes}
            />
          ),
        }}
        onRowClick={(params) => {
          if (params.row.situacaoId) navigate(`/situacao/${params.row.situacaoId}`);
        }}
        pageSizeOptions={[25, 50, 100, 200]}
        initialState={{
          pagination: { paginationModel: { pageSize: 100 } },
          sorting: { sortModel: [{ field: 'departamento', sort: 'asc' }] },
        }}
        localeText={LOCALE}
        sx={gridSx}
      />
    </Box>
  );
}
