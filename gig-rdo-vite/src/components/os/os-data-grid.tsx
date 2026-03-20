import { useMemo } from 'react';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { format, parseISO } from 'date-fns';
import type { OsListItem } from '@/types/os-list-types';

interface OsDataGridProps {
  rows: OsListItem[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (model: GridPaginationModel) => void;
}

function statusColor(status: string): 'warning' | 'info' | 'success' | 'error' | 'default' {
  const map: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
    A: 'warning',
    E: 'info',
    F: 'success',
    C: 'error',
  };
  return map[status] ?? 'default';
}

function fmtDate(val: string | null | undefined) {
  if (!val) return '-';
  try {
    return format(parseISO(val), 'dd/MM/yyyy');
  } catch {
    return val;
  }
}

export function OsDataGrid({
  rows,
  total,
  page,
  pageSize,
  isLoading,
  onPageChange,
}: OsDataGridProps) {
  const columns: GridColDef<OsListItem>[] = useMemo(
    () => [
      { field: 'NUOS', headerName: 'OS', width: 80 },
      {
        field: 'DTABERTURA',
        headerName: 'Abertura',
        width: 110,
        valueFormatter: (value: string) => fmtDate(value),
      },
      {
        field: 'STATUS',
        headerName: 'Status',
        width: 120,
        renderCell: ({ row }) => (
          <Chip
            label={row.statusLabel}
            color={statusColor(row.STATUS)}
            size="small"
            variant="outlined"
          />
        ),
      },
      { field: 'tipoLabel', headerName: 'Tipo', width: 100 },
      { field: 'manutencaoLabel', headerName: 'Manutencao', width: 120 },
      { field: 'placa', headerName: 'Placa', width: 100 },
      { field: 'marcaModelo', headerName: 'Veiculo', width: 160 },
      { field: 'nomeUsuAbertura', headerName: 'Aberto por', width: 150 },
      { field: 'qtdServicos', headerName: 'Servicos', width: 90, type: 'number' },
      {
        field: 'DATAFIN',
        headerName: 'Fechamento',
        width: 110,
        valueFormatter: (value: string | null) => fmtDate(value),
      },
    ],
    [],
  );

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.NUOS}
      loading={isLoading}
      paginationMode="server"
      rowCount={total}
      paginationModel={{ page: page - 1, pageSize }}
      onPaginationModelChange={onPageChange}
      pageSizeOptions={[15, 30, 50]}
      density="compact"
      disableRowSelectionOnClick
      sx={{ border: 0, '& .MuiDataGrid-cell': { fontSize: 13 } }}
      autoHeight
    />
  );
}
