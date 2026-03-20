import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import type { PatrimonioMobilizacaoVeiculo } from '@/types/patrimonio-types';

interface PatrimonioMobilizacaoVeiculosProps {
  data: PatrimonioMobilizacaoVeiculo[] | undefined;
  isLoading: boolean;
}

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v);

export function PatrimonioMobilizacaoVeiculos({
  data,
  isLoading,
}: PatrimonioMobilizacaoVeiculosProps) {
  const navigate = useNavigate();

  const columns = useMemo<GridColDef<PatrimonioMobilizacaoVeiculo>[]>(
    () => [
      {
        field: 'tag',
        headerName: 'TAG',
        width: 120,
        renderCell: (params) => (
          <span style={{ fontWeight: 700 }}>{params.value}</span>
        ),
      },
      { field: 'placa', headerName: 'Placa', width: 100 },
      { field: 'tipoEquipamento', headerName: 'Tipo', width: 160 },
      { field: 'categoria', headerName: 'Categoria', width: 150 },
      { field: 'cliente', headerName: 'Cliente', width: 220 },
      {
        field: 'dias',
        headerName: 'Dias',
        width: 80,
        align: 'right',
        headerAlign: 'right',
      },
      {
        field: 'vlrAquisicao',
        headerName: 'Valor',
        width: 140,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) =>
          typeof params.value === 'number' ? fmtCurrency(params.value) : '-',
      },
      { field: 'servico', headerName: 'Servico', width: 180 },
    ],
    [],
  );

  const handleRowClick = useCallback(
    (params: GridRowParams<PatrimonioMobilizacaoVeiculo>) => {
      navigate(`/patrimonio/bem/${encodeURIComponent(params.row.codbem)}`);
    },
    [navigate],
  );

  return (
    <DataGrid
      rows={data ?? []}
      columns={columns}
      loading={isLoading}
      getRowId={(row) => row.codbem}
      density="compact"
      disableRowSelectionOnClick
      onRowClick={handleRowClick}
      pageSizeOptions={[25, 50, 100]}
      initialState={{
        sorting: { sortModel: [{ field: 'tag', sort: 'asc' }] },
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
