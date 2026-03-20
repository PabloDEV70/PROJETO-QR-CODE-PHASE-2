import { useMemo, useCallback } from 'react';
import { Box } from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
  type GridRowClassNameParams,
} from '@mui/x-data-grid';
import { dataGridPtBR } from '@/utils/datagrid-locale';
import { buildServicosColumns } from './os-servicos-columns';
import type { OsColabServico } from '@/types/os-list-types';

const LIMITE_JORNADA_MIN = 720;

interface OsServicosGridProps {
  servicos: OsColabServico[];
}

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ px: 1, py: 0.5, gap: 0.5 }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <Box sx={{ flex: 1 }} />
      <GridToolbarQuickFilter debounceMs={300} />
    </GridToolbarContainer>
  );
}

export function OsServicosGrid({ servicos }: OsServicosGridProps) {
  const columns = useMemo(() => buildServicosColumns(), []);

  const getRowId = useCallback(
    (row: OsColabServico) => `${row.NUOS}-${row.sequencia}-${row.dtInicio ?? ''}`,
    [],
  );

  const getRowClassName = useCallback(
    (params: GridRowClassNameParams<OsColabServico>) => {
      if (params.row.tempoGastoMin > LIMITE_JORNADA_MIN) return 'row-anomalia';
      return '';
    },
    [],
  );

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <DataGrid<OsColabServico>
        rows={servicos}
        columns={columns}
        getRowId={getRowId}
        getRowClassName={getRowClassName}
        density="compact"
        disableRowSelectionOnClick
        initialState={{
          sorting: { sortModel: [{ field: 'dtInicio', sort: 'desc' }] },
          pagination: { paginationModel: { pageSize: 25, page: 0 } },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        localeText={dataGridPtBR}
        slots={{ toolbar: CustomToolbar }}
        slotProps={{
          loadingOverlay: { variant: 'linear-progress' as const },
        }}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          minHeight: 300,
          '& .MuiDataGrid-cell': { fontSize: '0.78rem' },
          '& .MuiDataGrid-columnHeader': { fontSize: '0.72rem', fontWeight: 700 },
          '& .row-anomalia': { bgcolor: 'rgba(255,152,0,0.06)' },
          '& .row-anomalia:hover': { bgcolor: 'rgba(255,152,0,0.12) !important' },
        }}
      />
    </Box>
  );
}
