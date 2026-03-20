import { useMemo } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Paper } from '@mui/material';
import type { OsAnaliseTipoVeiculo } from '@/types/os-analise-types';

interface OsAnaliseGridProps {
  rows: OsAnaliseTipoVeiculo[];
  isLoading: boolean;
  onRowClick: (tipoVeiculo: string) => void;
}

function fmtTempo(minutos: number | null): string {
  if (minutos == null) return '—';
  if (minutos < 60) return `${Math.round(minutos)} min`;
  if (minutos <= 1440) return `${(minutos / 60).toFixed(1)}h`;
  return `${(minutos / 1440).toFixed(1)} dias`;
}

export function OsAnaliseGrid({ rows, isLoading, onRowClick }: OsAnaliseGridProps) {
  const columns = useMemo<GridColDef<OsAnaliseTipoVeiculo>[]>(() => [
    {
      field: 'tipoVeiculo',
      headerName: 'Tipo Veiculo',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'totalOs',
      headerName: 'OS',
      width: 90,
      type: 'number',
    },
    {
      field: 'totalExecucoes',
      headerName: 'Execucoes',
      width: 100,
      type: 'number',
    },
    {
      field: 'mediaMinutos',
      headerName: 'Media',
      width: 100,
      type: 'number',
      valueFormatter: (value: number | null) => fmtTempo(value),
    },
    {
      field: 'minMinutos',
      headerName: 'Min',
      width: 90,
      type: 'number',
      valueFormatter: (value: number | null) => fmtTempo(value),
    },
    {
      field: 'maxMinutos',
      headerName: 'Max',
      width: 90,
      type: 'number',
      valueFormatter: (value: number | null) => fmtTempo(value),
    },
    {
      field: 'veiculosDistintos',
      headerName: 'Veiculos',
      width: 90,
      type: 'number',
    },
  ], []);

  return (
    <Paper sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.tipoVeiculo}
        density="compact"
        autoHeight
        disableRowSelectionOnClick
        onRowClick={(params) => onRowClick(params.row.tipoVeiculo)}
        pageSizeOptions={[15, 30, 50]}
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 15 } },
        }}
        sx={{
          '& .MuiDataGrid-row': { cursor: 'pointer' },
          '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
        }}
      />
    </Paper>
  );
}
