import { useMemo } from 'react';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import type { ApontamentoPendente } from '@/types/apontamentos-types';

interface PendentesDataGridProps {
  rows: ApontamentoPendente[];
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

export function PendentesDataGrid({
  rows, total, page, pageSize, isLoading, onPageChange,
}: PendentesDataGridProps) {
  const columns: GridColDef<ApontamentoPendente>[] = useMemo(() => [
    { field: 'CODIGO', headerName: 'Codigo', width: 80 },
    { field: 'SEQ', headerName: 'Seq', width: 60 },
    { field: 'DESCRITIVO', headerName: 'Descritivo', flex: 1, minWidth: 200 },
    { field: 'CODPROD', headerName: 'Cod Prod', width: 80 },
    { field: 'DESCRPROD', headerName: 'Produto', width: 160 },
    { field: 'QTD', headerName: 'Qtd', width: 60, type: 'number' },
    { field: 'PLACA', headerName: 'Placa', width: 90 },
    { field: 'MARCAMODELO', headerName: 'Modelo', width: 150 },
    { field: 'TAG', headerName: 'Tag', width: 80 },
    {
      field: 'DTINCLUSAO', headerName: 'Data', width: 100,
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
