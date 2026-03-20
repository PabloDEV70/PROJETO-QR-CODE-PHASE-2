import { useMemo } from 'react';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { format, parseISO } from 'date-fns';
import type { ApontamentoTimeline } from '@/types/apontamentos-types';

interface TimelineDataGridProps {
  rows: ApontamentoTimeline[];
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

export function TimelineDataGrid({
  rows, total, page, pageSize, isLoading, onPageChange,
}: TimelineDataGridProps) {
  const columns: GridColDef<ApontamentoTimeline>[] = useMemo(() => [
    {
      field: 'DTINCLUSAO', headerName: 'Data', width: 100,
      valueFormatter: (value: string | null) => fmtDate(value),
    },
    { field: 'CODAPONTAMENTO', headerName: 'Apontamento', width: 100 },
    { field: 'SEQ', headerName: 'Seq', width: 60 },
    { field: 'DESCRITIVO', headerName: 'Descritivo', flex: 1, minWidth: 200 },
    { field: 'DESCRPROD', headerName: 'Produto', width: 150 },
    { field: 'QTD', headerName: 'Qtd', width: 60, type: 'number' },
    {
      field: 'GERAOS', headerName: 'Gera OS', width: 80,
      renderCell: ({ value }) => (
        <Chip
          label={value === 'S' ? 'Sim' : 'Nao'}
          size="small"
          color={value === 'S' ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    { field: 'NUOS', headerName: 'OS', width: 80 },
    { field: 'KM', headerName: 'KM', width: 80, type: 'number' },
    { field: 'HORIMETRO', headerName: 'Horimetro', width: 90, type: 'number' },
  ], []);

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => `${row.CODAPONTAMENTO}-${row.SEQ}`}
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
