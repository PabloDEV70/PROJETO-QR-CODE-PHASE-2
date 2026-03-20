import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';
import { dataGridPtBR } from '@/utils/datagrid-locale';
import type { RdoListItem, RdoListResponse } from '@/types/rdo-types';
import type { Density } from '@/utils/rdo-filter-helpers';
import { buildRdoColumns, getRdoColumnVisibility } from './rdo-man-columns';
import { useResponsive } from '@/hooks/use-responsive';
import { ProdutividadeDrawer } from './produtividade-drawer';

interface RdoManTableProps {
  data?: RdoListResponse;
  isLoading: boolean;
  page: number;
  pageSize: number;
  density: Density;
  onPaginationChange: (model: GridPaginationModel) => void;
}

export function RdoManTable({
  data, isLoading, page, pageSize, density, onPaginationChange,
}: RdoManTableProps) {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [prodRow, setProdRow] = useState<RdoListItem | null>(null);

  const columns = useMemo(
    () => buildRdoColumns(navigate, { onProdClick: setProdRow, onHexClick: setProdRow }),
    [navigate],
  );

  const columnVisibilityModel = useMemo(
    () => getRdoColumnVisibility(isMobile, isTablet),
    [isMobile, isTablet],
  );

  const handleRowClick = useCallback(
    (params: { row: RdoListItem }) => {
      navigate(`/manutencao/rdo/${params.row.CODRDO}`);
    },
    [navigate],
  );

  return (
    <>
      <DataGrid
        rows={data?.data || []}
        columns={columns}
        getRowId={(row) => row.CODRDO}
        loading={isLoading}
        paginationMode="server"
        rowCount={data?.meta?.totalRegistros || 0}
        paginationModel={{ page: page - 1, pageSize }}
        onPaginationModelChange={onPaginationChange}
        pageSizeOptions={[25, 50, 100]}
        density={density}
        columnVisibilityModel={columnVisibilityModel}
        onRowClick={handleRowClick}
        disableRowSelectionOnClick
        localeText={dataGridPtBR}
        sx={{
          bgcolor: 'background.paper',
          border: 1, borderColor: 'divider', borderRadius: 3, minHeight: 400,
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            '&:hover': { bgcolor: 'action.hover' },
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
            borderBottom: 2, borderColor: 'divider',
          },
          '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
        }}
      />
      <ProdutividadeDrawer
        open={!!prodRow}
        onClose={() => setProdRow(null)}
        row={prodRow}
      />
    </>
  );
}
