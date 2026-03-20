import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import { Chip, type ChipProps } from '@mui/material';
import type { VeiculoListItem, VeiculoStatus } from '@/types/veiculo-list-types';

interface VeiculoDataGridProps {
  rows: VeiculoListItem[];
  isLoading: boolean;
}

const STATUS_COLOR: Record<VeiculoStatus, ChipProps['color']> = {
  LIVRE: 'success',
  EM_USO: 'info',
  MANUTENCAO: 'error',
  AGUARDANDO_MANUTENCAO: 'warning',
  BLOQUEIO_COMERCIAL: 'error',
  PARADO: 'default',
  ALUGADO_CONTRATO: 'info',
  RESERVADO_CONTRATO: 'warning',
  AGENDADO: 'secondary',
};

export function VeiculoDataGrid({ rows, isLoading }: VeiculoDataGridProps) {
  const navigate = useNavigate();

  const columns = useMemo<GridColDef<VeiculoListItem>[]>(
    () => [
      { field: 'codveiculo', headerName: 'Cod', width: 80 },
      {
        field: 'placa',
        headerName: 'Placa',
        width: 100,
        renderCell: (params) => (
          <span style={{ fontWeight: 700 }}>{params.value}</span>
        ),
      },
      {
        field: 'marcaModelo',
        headerName: 'Veiculo',
        width: 200,
        flex: 1,
        minWidth: 160,
      },
      { field: 'categoria', headerName: 'Categoria', width: 120 },
      { field: 'tag', headerName: 'Tag', width: 90 },
      {
        field: 'status',
        headerName: 'Status',
        width: 160,
        renderCell: (params) => (
          <Chip
            label={params.row.statusLabel}
            color={STATUS_COLOR[params.value as VeiculoStatus] ?? 'default'}
            size="small"
          />
        ),
      },
      {
        field: 'osAtiva',
        headerName: 'OS Ativa',
        width: 100,
        valueGetter: (value: VeiculoListItem['osAtiva']) => value?.nuos || '-',
      },
      {
        field: 'metricas.kmAtual',
        headerName: 'KM',
        width: 110,
        valueGetter: (_value: unknown, row: VeiculoListItem) =>
          row.metricas.kmAtual,
        renderCell: (params) =>
          typeof params.value === 'number'
            ? params.value.toLocaleString('pt-BR')
            : '-',
      },
      {
        field: 'metricas.totalOsAno',
        headerName: 'OS/Ano',
        width: 90,
        type: 'number',
        valueGetter: (_value: unknown, row: VeiculoListItem) =>
          row.metricas.totalOsAno,
      },
      {
        field: 'alertas',
        headerName: 'Alertas',
        width: 80,
        renderCell: (params) => {
          const count = (params.value as VeiculoListItem['alertas'])?.length ?? 0;
          return count > 0 ? (
            <span style={{ color: '#d32f2f', fontWeight: 700 }}>{count}</span>
          ) : (
            '-'
          );
        },
      },
    ],
    [],
  );

  const handleRowClick = useCallback(
    (params: GridRowParams<VeiculoListItem>) => {
      navigate(`/manutencao/veiculo/${params.row.codveiculo}`);
    },
    [navigate],
  );

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={isLoading}
      getRowId={(row) => row.codveiculo}
      density="compact"
      disableRowSelectionOnClick
      onRowClick={handleRowClick}
      pageSizeOptions={[25, 50, 100]}
      initialState={{
        sorting: { sortModel: [{ field: 'status', sort: 'asc' }] },
        pagination: { paginationModel: { pageSize: 25 } },
      }}
      sx={{
        border: 0,
        height: 650,
        '& .MuiDataGrid-row': { cursor: 'pointer' },
      }}
    />
  );
}
