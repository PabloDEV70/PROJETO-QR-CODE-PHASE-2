import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';
import { dataGridPtBR } from '@/utils/datagrid-locale';
import type { RdoDetalhePeriodo, RdoDetalhesResponse } from '@/types/rdo-types';
import type { Density } from '@/utils/rdo-filter-helpers';
import { buildDetalhesColumns, getDetalhesColumnVisibility } from './rdo-detalhes-columns';
import { useResponsive } from '@/hooks/use-responsive';

interface RdoDetalhesTableProps {
  data?: RdoDetalhesResponse;
  isLoading: boolean;
  page: number;
  pageSize: number;
  density: Density;
  onPaginationChange: (model: GridPaginationModel) => void;
}

export function RdoDetalhesTable({
  data, isLoading, page, pageSize, density, onPaginationChange,
}: RdoDetalhesTableProps) {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const columns = useMemo(() => buildDetalhesColumns(navigate), [navigate]);
  const columnVisibilityModel = useMemo(
    () => getDetalhesColumnVisibility(isMobile, isTablet),
    [isMobile, isTablet],
  );

  const getRowId = useCallback(
    (row: RdoDetalhePeriodo) => `${row.CODRDO}-${row.ITEM}`,
    [],
  );

  return (
    <DataGrid
      rows={data?.data || []}
      columns={columns}
      getRowId={getRowId}
      loading={isLoading}
      paginationMode="server"
      rowCount={data?.meta?.totalRegistros || 0}
      paginationModel={{ page: page - 1, pageSize }}
      onPaginationModelChange={onPaginationChange}
      pageSizeOptions={[25, 50, 100]}
      density={density}
      columnVisibilityModel={columnVisibilityModel}
      disableRowSelectionOnClick
      localeText={dataGridPtBR}
      sx={{
        bgcolor: 'background.paper',
        border: 1, borderColor: 'divider', borderRadius: 2, minHeight: 400,
        '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
        '& .MuiDataGrid-columnHeaders': {
          bgcolor: 'grey.50', borderBottom: 2, borderColor: 'divider',
        },
        '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
      }}
    />
  );
}
