import { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { dataGridPtBR } from '@/utils/datagrid-locale';
import { fmtMin } from '@/utils/wrench-time-categories';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { ColabRanking } from '@/types/rdo-analytics-types';

const columns: GridColDef[] = [
  {
    field: 'rank', headerName: '#', width: 50, sortable: false,
    renderCell: (p) => p.api.getRowIndexRelativeToVisibleRows(p.id) + 1,
  },
  {
    field: 'nomeparc', headerName: 'Colaborador', flex: 1, minWidth: 200,
    renderCell: (p) => (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
        <FuncionarioAvatar
          codparc={p.row.codparc} nome={p.row.nomeparc} size="small"
        />
        <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.8rem' }}>
          {p.row.nomeparc}
        </Typography>
      </Stack>
    ),
  },
  { field: 'cargo', headerName: 'Funcao', width: 180 },
  { field: 'departamento', headerName: 'Departamento', width: 160 },
  { field: 'totalRdos', headerName: 'RDOs', width: 70, type: 'number' },
  {
    field: 'minutosProdu', headerName: 'Horas Produtivas', width: 140,
    type: 'number',
    valueFormatter: (value: number) => fmtMin(value),
  },
  {
    field: 'produtividadePercent', headerName: '% Produtivo', width: 110,
    type: 'number',
    valueFormatter: (value: number) => `${value}%`,
  },
];

interface WtColabGridProps {
  data: ColabRanking[] | undefined;
  isLoading: boolean;
}

export function WtColabGrid({ data, isLoading }: WtColabGridProps) {
  const rows = useMemo(() => data ?? [], [data]);

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <DataGrid
        rows={rows} columns={columns} loading={isLoading}
        getRowId={(r) => r.codparc}
        initialState={{
          sorting: { sortModel: [{ field: 'minutosProdu', sort: 'desc' }] },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick density="standard" rowHeight={56}
        localeText={dataGridPtBR}
        sx={{
          bgcolor: 'background.paper', borderRadius: 2, minHeight: 300,
          '& .MuiDataGrid-cell': { fontSize: '0.8rem' },
          '& .MuiDataGrid-columnHeader': { fontSize: '0.75rem' },
        }}
        slotProps={{ loadingOverlay: { variant: 'linear-progress' as const } }}
      />
    </Box>
  );
}
