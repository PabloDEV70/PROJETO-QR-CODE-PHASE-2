import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import {
  DataGrid,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import { dataGridPtBR } from '@/utils/datagrid-locale';
import { buildColumns } from './wt-rdo-grid-columns';
import type { RdoListResponse } from '@/types/rdo-types';

export interface WtRdoGridProps {
  data?: RdoListResponse;
  isLoading: boolean;
  page: number;
  pageSize: number;
  onPaginationChange: (model: GridPaginationModel) => void;
}

export function WtRdoGrid({
  data, isLoading, page, pageSize, onPaginationChange,
}: WtRdoGridProps) {
  const nav = useNavigate();
  const columns = useMemo(() => buildColumns(nav), [nav]);
  const rows = data?.data || [];
  const total = data?.meta?.totalRegistros || 0;

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <DataGrid
        rows={rows} columns={columns} loading={isLoading}
        getRowId={(r) => r.CODRDO}
        paginationMode="server" rowCount={total}
        paginationModel={{ page: page - 1, pageSize }}
        onPaginationModelChange={(m) =>
          onPaginationChange({ page: m.page + 1, pageSize: m.pageSize })
        }
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick density="compact" rowHeight={60}
        localeText={dataGridPtBR}
        sx={{
          bgcolor: 'background.paper', borderRadius: 2, minHeight: 300,
          '& .MuiDataGrid-cell': { fontSize: '0.78rem' },
          '& .MuiDataGrid-columnHeader': { fontSize: '0.72rem' },
        }}
        slotProps={{ loadingOverlay: { variant: 'linear-progress' as const } }}
      />
    </Box>
  );
}
