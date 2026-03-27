import { DataGrid, type GridColDef, type GridValidRowModel } from '@mui/x-data-grid';
import { Paper } from '@mui/material';

interface DataTableProps<R extends GridValidRowModel> {
  rows: R[];
  columns: GridColDef<R>[];
  height?: number | string;
  noPaper?: boolean;
  getRowId?: (row: R) => string | number;
  onRowClick?: (params: { row: R }) => void;
  rowCount?: number;
  paginationMode?: 'client' | 'server';
  paginationModel?: { page: number; pageSize: number };
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
  loading?: boolean;
  density?: 'standard' | 'comfortable' | 'compact';
  initialState?: Record<string, unknown>;
}

export function DataTable<R extends GridValidRowModel>({
  rows,
  columns,
  height = 600,
  noPaper = false,
  onRowClick,
  ...rest
}: DataTableProps<R>) {
  const grid = (
    <DataGrid
      rows={rows}
      columns={columns as GridColDef[]}
      pageSizeOptions={[10, 25, 50, 100]}
      disableRowSelectionOnClick
      onRowClick={onRowClick as never}
      sx={{
        height,
        '& .MuiDataGrid-row': { cursor: onRowClick ? 'pointer' : undefined },
      }}
      {...rest}
    />
  );

  if (noPaper) return grid;
  return <Paper>{grid}</Paper>;
}
