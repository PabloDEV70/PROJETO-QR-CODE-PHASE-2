import { useMemo, useCallback } from 'react';
import { Box, Chip } from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
  type GridColDef,
} from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import { dataGridPtBR } from '@/utils/datagrid-locale';
import type { OsServiceItem } from '@/types/os-detail-types';

interface OsDetailServicosGridProps {
  servicos: OsServiceItem[];
  isLoading?: boolean;
}

const STATUS_COLORS = {
  A: 'default',
  E: 'info',
  F: 'success',
  C: 'error',
} as const;

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

function formatDate(date: string | null): string {
  if (!date) return '-';
  try {
    return format(parseISO(date), 'dd/MM/yyyy HH:mm');
  } catch {
    return '-';
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function OsDetailServicosGrid({ servicos, isLoading }: OsDetailServicosGridProps) {
  const columns = useMemo<GridColDef<OsServiceItem>[]>(
    () => [
      {
        field: 'SEQUENCIA',
        headerName: '#',
        width: 80,
        type: 'number',
      },
      {
        field: 'nomeProduto',
        headerName: 'Servico',
        flex: 1,
        minWidth: 200,
      },
      {
        field: 'statusLabel',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => {
          const status = params.row.STATUS;
          const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'default';
          return (
            <Chip
              label={params.value || status}
              color={color}
              size="small"
            />
          );
        },
      },
      {
        field: 'DATAINI',
        headerName: 'Inicio',
        width: 150,
        valueFormatter: (value) => formatDate(value),
      },
      {
        field: 'DATAFIN',
        headerName: 'Fim',
        width: 150,
        valueFormatter: (value) => formatDate(value),
      },
      {
        field: 'TEMPO',
        headerName: 'Tempo (min)',
        width: 100,
        type: 'number',
        valueFormatter: (value) => value ?? '-',
      },
      {
        field: 'VLRTOT',
        headerName: 'Valor Total',
        width: 120,
        type: 'number',
        valueFormatter: (value) => formatCurrency(value),
      },
      {
        field: 'OBSERVACAO',
        headerName: 'Obs',
        width: 200,
        renderCell: (params) => (
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {params.value || '-'}
          </Box>
        ),
      },
    ],
    [],
  );

  const getRowId = useCallback(
    (row: OsServiceItem) => `${row.NUOS}-${row.SEQUENCIA}`,
    [],
  );

  if (servicos.length === 0 && !isLoading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        Nenhum servico registrado
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <DataGrid<OsServiceItem>
        rows={servicos}
        columns={columns}
        getRowId={getRowId}
        density="compact"
        disableRowSelectionOnClick
        loading={isLoading}
        initialState={{
          sorting: { sortModel: [{ field: 'SEQUENCIA', sort: 'asc' }] },
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
        }}
      />
    </Box>
  );
}
