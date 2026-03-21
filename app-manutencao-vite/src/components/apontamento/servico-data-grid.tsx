import { useMemo, useState, useRef } from 'react';
import {
  DataGrid, type GridColDef,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv, ExportPrint,
  QuickFilter, QuickFilterControl, QuickFilterTrigger,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { styled } from '@mui/material/styles';
import {
  Badge, Box, Button, Chip, Divider, IconButton, InputAdornment,
  ListItemText, Menu, MenuItem, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import {
  ViewColumn, FilterList, FileDownload, Search, Add, Edit, Delete, Refresh,
} from '@mui/icons-material';
import type { ServicoApontamento } from '@/types/apontamento-types';

// ── Styled QuickFilter ──

type OwnerState = { expanded: boolean };
const StyledQuickFilter = styled(QuickFilter)({ display: 'grid', alignItems: 'center' });
const StyledSearchTrigger = styled(ToolbarButton)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: '1 / 1', width: 'min-content', height: 'min-content', zIndex: 1,
    opacity: ownerState.expanded ? 0 : 1, pointerEvents: ownerState.expanded ? 'none' : 'auto',
    transition: theme.transitions.create(['opacity']),
  }),
);
const StyledSearchField = styled(TextField)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: '1 / 1', overflowX: 'clip',
    width: ownerState.expanded ? 200 : 'var(--trigger-width)',
    opacity: ownerState.expanded ? 1 : 0,
    transition: theme.transitions.create(['width', 'opacity']),
  }),
);

// ── Toolbar ──

interface ServicosToolbarProps {
  total: number;
  onAdd?: () => void;
  onRefresh?: () => void;
}

function ServicosToolbar({ total, onAdd, onRefresh }: ServicosToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLButtonElement>(null);

  return (
    <Toolbar>
      <Typography fontWeight={700} fontSize={13} sx={{ mr: 0.5 }}>
        Servicos
      </Typography>
      <Tooltip title={`${total} servico(s) cadastrado(s) neste apontamento`}>
        <Chip label={total} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
      </Tooltip>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 1 }} />

      {onAdd && (
        <Tooltip title="Adicionar novo servico a este apontamento">
          <Button
            variant="contained" color="success" size="small"
            startIcon={<Add />}
            onClick={onAdd}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12, borderRadius: '6px', px: 1.5, py: 0.25 }}
          >
            Novo Servico
          </Button>
        </Tooltip>
      )}

      <Box sx={{ flex: 1 }} />

      {onRefresh && (
        <Tooltip title="Recarregar servicos">
          <ToolbarButton onClick={onRefresh}><Refresh fontSize="small" /></ToolbarButton>
        </Tooltip>
      )}

      <Tooltip title="Gerenciar colunas visiveis">
        <ColumnsPanelTrigger render={<ToolbarButton />}><ViewColumn fontSize="small" /></ColumnsPanelTrigger>
      </Tooltip>

      <Tooltip title="Filtros avancados">
        <FilterPanelTrigger
          render={(fp, state) => (
            <ToolbarButton {...fp} color="default">
              <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                <FilterList fontSize="small" />
              </Badge>
            </ToolbarButton>
          )}
        />
      </Tooltip>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Exportar dados">
        <ToolbarButton ref={exportRef} onClick={() => setExportOpen(true)}>
          <FileDownload fontSize="small" />
        </ToolbarButton>
      </Tooltip>
      <Menu
        anchorEl={exportRef.current} open={exportOpen} onClose={() => setExportOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <ExportPrint render={<MenuItem />} onClick={() => setExportOpen(false)}>
          <ListItemText>Imprimir</ListItemText>
        </ExportPrint>
        <ExportCsv render={<MenuItem />} onClick={() => setExportOpen(false)}>
          <ListItemText>Baixar CSV</ListItemText>
        </ExportCsv>
      </Menu>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      <StyledQuickFilter>
        <QuickFilterTrigger
          render={(triggerProps, state) => (
            <Tooltip title="Buscar nos servicos">
              <StyledSearchTrigger {...triggerProps} ownerState={{ expanded: state.expanded }} color="default">
                <Search fontSize="small" />
              </StyledSearchTrigger>
            </Tooltip>
          )}
        />
        <QuickFilterControl
          render={({ ref, ...controlProps }, state) => (
            <StyledSearchField
              {...controlProps} ownerState={{ expanded: state.expanded }} inputRef={ref}
              placeholder="Buscar..." size="small"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                },
              }}
            />
          )}
        />
      </StyledQuickFilter>
    </Toolbar>
  );
}

// ── Locale ──

const LOCALE = {
  ...ptBR.components.MuiDataGrid.defaultProps.localeText,
  noRowsLabel: 'Nenhum servico encontrado',
  noResultsOverlayLabel: 'Nenhum resultado encontrado',
};

// ── Helpers ──

function fmtDateTime(val: string | null): string {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  const date = d.toLocaleDateString('pt-BR');
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return time === '00:00' ? date : `${date} ${time}`;
}

// ── Grid ──

interface ServicoDataGridProps {
  servicos: ServicoApontamento[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (s: ServicoApontamento) => void;
  onDelete: (s: ServicoApontamento) => void;
  onRefresh: () => void;
}

export function ServicoDataGrid({
  servicos, isLoading, onAdd, onEdit, onDelete, onRefresh,
}: ServicoDataGridProps) {
  const columns: GridColDef<ServicoApontamento>[] = useMemo(() => [
    {
      field: 'SEQ', headerName: 'Seq', width: 55, align: 'center', headerAlign: 'center',
    },
    {
      field: 'DESCRPROD', headerName: 'Produto / Servico', flex: 1, minWidth: 200,
      renderCell: ({ row }) => (
        <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }} noWrap>
            {row.DESCRPROD ?? '-'}
          </Typography>
          {row.CODPROD && (
            <Typography sx={{ fontSize: 10, color: 'text.disabled', lineHeight: 1.2 }}>
              Cod. {row.CODPROD}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'DESCRGRUPOPROD', headerName: 'Grupo', width: 150,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
          {(value as string) ?? '-'}
        </Typography>
      ),
    },
    {
      field: 'DESCRITIVO', headerName: 'Descritivo', width: 200,
      renderCell: ({ value }) => (
        <Tooltip title={(value as string) ?? ''} placement="bottom-start">
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
            {(value as string) ?? '-'}
          </Typography>
        </Tooltip>
      ),
    },
    { field: 'QTD', headerName: 'Qtd', width: 65, align: 'center', headerAlign: 'center', type: 'number' },
    { field: 'HR', headerName: 'HR', width: 65, align: 'center', headerAlign: 'center', type: 'number' },
    { field: 'KM', headerName: 'KM', width: 70, align: 'center', headerAlign: 'center', type: 'number' },
    {
      field: 'GERAOS', headerName: 'Gera OS', width: 85, align: 'center', headerAlign: 'center',
      renderCell: ({ value }) => value === 'S'
        ? <Chip label="Sim" size="small" color="info" sx={{ fontSize: 11, height: 22 }} />
        : <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>Nao</Typography>,
    },
    {
      field: 'NUOS', headerName: 'OS', width: 80,
      renderCell: ({ value }) => value
        ? <Tooltip title={`Vinculado a OS #${value}`}><Chip label={`#${value}`} size="small" sx={{ fontSize: 11, height: 22, fontWeight: 700 }} /></Tooltip>
        : <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>-</Typography>,
    },
    {
      field: 'STATUSOS', headerName: 'Status OS', width: 115,
      renderCell: ({ value }) => {
        if (!value) return <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>-</Typography>;
        const v = value as string;
        const color = v === 'Finalizada' ? 'success' : v === 'Aberta' ? 'warning' : 'info';
        return <Chip label={v} size="small" color={color} variant="outlined" sx={{ fontSize: 11, height: 22, fontWeight: 600 }} />;
      },
    },
    {
      field: 'DTPROGRAMACAO', headerName: 'Programacao', width: 115,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12 }}>{fmtDateTime(value as string | null)}</Typography>
      ),
    },
    {
      field: 'actions' as const, headerName: 'Acoes', width: 90, sortable: false, disableColumnMenu: true,
      headerAlign: 'center', align: 'center',
      renderCell: ({ row }: { row: ServicoApontamento }) => (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title="Editar este servico">
            <IconButton size="small" onClick={() => onEdit(row)}>
              <Edit sx={{ fontSize: 16, color: 'text.secondary' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir este servico">
            <IconButton size="small" onClick={() => onDelete(row)}>
              <Delete sx={{ fontSize: 16, color: 'error.main' }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    } as GridColDef<ServicoApontamento>,
  ], [onEdit, onDelete]);

  const toolbarProps = useMemo<ServicosToolbarProps>(() => ({
    total: servicos.length,
    onAdd,
    onRefresh,
  }), [servicos.length, onAdd, onRefresh]);

  return (
    <Box sx={{ width: '100%', flex: 1, minHeight: 0 }}>
      <DataGrid
        rows={servicos}
        columns={columns}
        getRowId={(row) => `${row.CODIGO}-${row.SEQ}`}
        loading={isLoading}
        rowHeight={48}
        columnHeaderHeight={40}
        disableRowSelectionOnClick
        showToolbar
        slots={{ toolbar: ServicosToolbar as never }}
        slotProps={{ toolbar: toolbarProps as never }}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        localeText={LOCALE}
        sx={{
          border: 0,
          '& .MuiDataGrid-main': { borderRadius: 0 },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            borderBottom: '2px solid',
            borderColor: 'divider',
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12 },
          },
          '& .MuiDataGrid-row': {
            '&:nth-of-type(even)': {
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            },
            '&:hover': {
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            },
          },
          '& .MuiDataGrid-cell': {
            fontSize: 13, borderColor: 'divider',
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid', borderColor: 'divider', minHeight: 44,
          },
          '& .MuiDataGrid-toolbarContainer': {
            borderBottom: '1px solid', borderColor: 'divider',
            px: 1, py: 0.25,
          },
        }}
      />
    </Box>
  );
}
