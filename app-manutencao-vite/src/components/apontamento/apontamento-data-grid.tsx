import { useMemo, useState, useCallback } from 'react';
import { DataGrid, type GridColDef, type GridSortModel, type GridPaginationModel, type GridFilterModel } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  ApontamentoGridToolbar,
  type ApontamentoGridToolbarProps,
} from './apontamento-grid-toolbar';
import { STATUS_OS_LABELS, STATUS_OS_COLORS, type StatusOS, type ApontamentoListItem } from '@/types/apontamento-types';

const LOCALE = {
  ...ptBR.components.MuiDataGrid.defaultProps.localeText,
  noRowsLabel: 'Nenhum apontamento encontrado',
  noResultsOverlayLabel: 'Nenhum resultado encontrado',
  toolbarQuickFilterPlaceholder: 'Buscar...',
  MuiTablePagination: {
    labelRowsPerPage: 'Linhas por pagina:',
    labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
      `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`,
  },
};

function TiposCell({ row }: { row: ApontamentoListItem }) {
  const entries: [string, string | null][] = [
    ['BORR', row.BORRCHARIA], ['ELET', row.ELETRICA], ['FUN', row.FUNILARIA],
    ['MEC', row.MECANICA], ['CALD', row.CALDEIRARIA],
  ];
  const chips = entries.filter(([, v]) => v === 'S').map(([l]) => l);
  if (!chips.length) return <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>-</Typography>;
  return (
    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.25 }}>
      {chips.map((c) => (
        <Chip key={c} label={c} size="small" sx={{ fontSize: 10, height: 20, fontWeight: 600 }} />
      ))}
    </Stack>
  );
}

function formatDate(val: string | null): string {
  if (!val) return '-';
  const d = new Date(val);
  return isNaN(d.getTime()) ? val : d.toLocaleDateString('pt-BR');
}

interface ApontamentoDataGridProps {
  rows: ApontamentoListItem[];
  rowCount: number;
  isLoading: boolean;
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  onPaginationModelChange: (m: GridPaginationModel) => void;
  onSortModelChange: (m: GridSortModel) => void;
  onRefresh: () => void;
  onEdit: (row: ApontamentoListItem) => void;
  onDelete: (row: ApontamentoListItem) => void;
  onAdd: () => void;
  statusOs: string;
  onStatusChange: (s: string) => void;
  isProd: boolean;
}

export function ApontamentoDataGrid({
  rows, rowCount, isLoading,
  paginationModel, sortModel,
  onPaginationModelChange, onSortModelChange,
  onRefresh, onEdit, onDelete, onAdd,
  statusOs, onStatusChange, isProd,
}: ApontamentoDataGridProps) {
  const [filterModel, setFM] = useState<GridFilterModel>({ items: [] });
  const columns: GridColDef<ApontamentoListItem>[] = useMemo(() => [
    { field: 'CODIGO', headerName: 'Cod', width: 80, align: 'right', headerAlign: 'right' },
    {
      field: 'TAG', headerName: 'TAG', width: 120,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{value || '-'}</Typography>
      ),
    },
    {
      field: 'PLACA', headerName: 'Veiculo', flex: 1, minWidth: 180,
      renderCell: ({ row }) => (
        <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }} noWrap>
            {row.PLACA || '-'}
          </Typography>
          {row.MARCAMODELO && (
            <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.2 }} noWrap>
              {row.MARCAMODELO}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'STATUSOS', headerName: 'Status', width: 130,
      renderCell: ({ value }) => {
        const s = value as StatusOS | null;
        if (!s) return <Chip label="N/A" size="small" sx={{ fontSize: 11 }} />;
        return (
          <Chip
            label={STATUS_OS_LABELS[s] ?? s}
            size="small"
            color={STATUS_OS_COLORS[s] ?? 'default'}
            sx={{ fontWeight: 600, fontSize: 11 }}
          />
        );
      },
    },
    {
      field: 'DTINCLUSAO', headerName: 'Data', width: 120,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12.5 }}>{formatDate(value as string | null)}</Typography>
      ),
    },
    {
      field: 'totalServicos', headerName: 'Servicos', width: 80, align: 'center', headerAlign: 'center',
      renderCell: ({ value }) => (
        <Chip label={value ?? 0} size="small" sx={{ fontWeight: 700, fontSize: 11, minWidth: 28 }} />
      ),
    },
    {
      field: 'tipos', headerName: 'Tipos', width: 180, sortable: false,
      renderCell: ({ row }) => <TiposCell row={row} />,
    },
    {
      field: 'actions', headerName: '', width: 90, sortable: false, disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.25}>
          <IconButton size="small" onClick={() => onEdit(row)} disabled={isProd}>
            <EditIcon sx={{ fontSize: 18, color: isProd ? 'text.disabled' : 'text.secondary' }} />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(row)} disabled={isProd}>
            <DeleteIcon sx={{ fontSize: 18, color: isProd ? 'text.disabled' : 'error.main' }} />
          </IconButton>
        </Stack>
      ),
    },
  ], [onEdit, onDelete, isProd]);

  const toolbarProps = useMemo<ApontamentoGridToolbarProps>(() => ({
    onRefresh,
    onAdd: isProd ? undefined : onAdd,
    statusOs,
    onStatusChange,
  }), [onRefresh, onAdd, statusOs, onStatusChange, isProd]);

  const handleFilterChange = useCallback((m: GridFilterModel) => setFM(m), []);

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 140px)' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.CODIGO}
        loading={isLoading}
        rowCount={rowCount}
        paginationMode="server"
        sortingMode="server"
        filterMode="client"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        filterModel={filterModel}
        onFilterModelChange={handleFilterChange}
        pageSizeOptions={[10, 25, 50, 100]}
        rowHeight={52}
        density="compact"
        disableRowSelectionOnClick
        showToolbar
        slots={{ toolbar: ApontamentoGridToolbar as never }}
        slotProps={{ toolbar: toolbarProps as never }}
        localeText={LOCALE}
        sx={{
          border: 1, borderColor: 'divider', borderRadius: 2,
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'rgba(46,125,50,0.04)',
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12.5 },
          },
          '& .MuiDataGrid-row': {
            transition: 'background-color 0.15s',
            '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.015)' },
            '&:hover': { bgcolor: 'rgba(46,125,50,0.07)' },
          },
          '& .MuiDataGrid-cell': {
            fontSize: 13, borderColor: 'divider', overflow: 'hidden',
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
          '& .MuiDataGrid-footerContainer': { borderTop: 1, borderColor: 'divider', minHeight: 44 },
          '& .MuiDataGrid-scrollbar--horizontal': { display: 'none' },
        }}
      />
    </Box>
  );
}
