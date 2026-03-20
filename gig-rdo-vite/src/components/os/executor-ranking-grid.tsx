import { useMemo } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import type { ExecutorRankingRow } from '@/types/executor-ranking-types';

interface ExecutorRankingGridProps {
  data: ExecutorRankingRow[] | undefined;
  isLoading: boolean;
}

function fmtPercent(val: number | null | undefined) {
  if (val === null || val === undefined) return '-';
  return `${val.toFixed(1)}%`;
}

function fmtMinutos(val: number | null | undefined) {
  if (val === null || val === undefined) return '-';
  return `${val.toFixed(0)} min`;
}

export function ExecutorRankingGrid({ data, isLoading }: ExecutorRankingGridProps) {
  const columns: GridColDef<ExecutorRankingRow>[] = useMemo(
    () => [
      {
        field: 'nomeExecutor',
        headerName: 'Executor',
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'totalOS',
        headerName: 'Total OS',
        width: 100,
        type: 'number',
      },
      {
        field: 'totalServicos',
        headerName: 'Servicos',
        width: 100,
        type: 'number',
      },
      {
        field: 'servicosConcluidos',
        headerName: 'Concluidos',
        width: 120,
        type: 'number',
      },
      {
        field: 'taxaConclusao',
        headerName: 'Taxa Conclusao',
        width: 140,
        type: 'number',
        valueFormatter: (value: number | null) => fmtPercent(value),
      },
      {
        field: 'tempoMedioMin',
        headerName: 'Tempo Medio',
        width: 130,
        type: 'number',
        valueFormatter: (value: number | null) => fmtMinutos(value),
      },
    ],
    [],
  );

  return (
    <DataGrid
      rows={data ?? []}
      columns={columns}
      getRowId={(row) => row.CODUSU}
      loading={isLoading}
      pageSizeOptions={[10, 25, 50]}
      initialState={{
        pagination: { paginationModel: { pageSize: 25 } },
      }}
      density="compact"
      disableRowSelectionOnClick
      sx={{ border: 0, '& .MuiDataGrid-cell': { fontSize: 13 } }}
      autoHeight
    />
  );
}
