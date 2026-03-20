import { useMemo } from 'react';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { format, parseISO } from 'date-fns';
import type { ApontamentoComOs } from '@/types/apontamentos-types';

interface ComOsDataGridProps {
  rows: ApontamentoComOs[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (model: GridPaginationModel) => void;
}

function fmtDate(val: string | null | undefined) {
  if (!val) return '-';
  try { return format(parseISO(val), 'dd/MM/yyyy'); }
  catch { return val; }
}

function statusColor(status: string | null): 'warning' | 'success' | 'error' | 'default' {
  if (!status) return 'default';
  const map: Record<string, 'warning' | 'success' | 'error'> = {
    A: 'warning', F: 'success', C: 'error',
  };
  return map[status] ?? 'default';
}

export function ComOsDataGrid({
  rows, total, page, pageSize, isLoading, onPageChange,
}: ComOsDataGridProps) {
  const columns: GridColDef<ApontamentoComOs>[] = useMemo(() => [
    { field: 'CODIGO', headerName: 'Codigo', width: 80 },
    { field: 'SEQ', headerName: 'Seq', width: 60 },
    { field: 'DESCRITIVO', headerName: 'Descritivo', flex: 1, minWidth: 200 },
    { field: 'NUOS', headerName: 'OS', width: 80 },
    {
      field: 'STATUS_OS', headerName: 'Status OS', width: 100,
      renderCell: ({ value }) => (
        <Chip label={value ?? '-'} size="small" color={statusColor(value)} variant="outlined" />
      ),
    },
    {
      field: 'DTABERTURA_OS', headerName: 'Abertura', width: 100,
      valueFormatter: (value: string | null) => fmtDate(value),
    },
    { field: 'CODVEICULO', headerName: 'Veiculo', width: 80 },
    { field: 'TAG', headerName: 'Tag', width: 80 },
    {
      field: 'DTINCLUSAO', headerName: 'Inclusao', width: 100,
      valueFormatter: (value: string | null) => fmtDate(value),
    },
  ], []);

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => `${row.CODIGO}-${row.SEQ}`}
      loading={isLoading}
      paginationMode="server"
      rowCount={total}
      paginationModel={{ page: page - 1, pageSize }}
      onPaginationModelChange={onPageChange}
      pageSizeOptions={[30, 50, 100]}
      density="compact"
      disableRowSelectionOnClick
      sx={{ border: 0, '& .MuiDataGrid-cell': { fontSize: 13 } }}
      autoHeight
    />
  );
}
