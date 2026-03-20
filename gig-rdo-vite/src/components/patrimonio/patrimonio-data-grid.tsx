import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { PatrimonioBemListItem } from '@/types/patrimonio-types';

interface PatrimonioDataGridProps {
  rows: PatrimonioBemListItem[];
  isLoading: boolean;
}

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v);

const fmtAge = (months: number | null) => {
  if (!months) return '-';
  const y = Math.floor(months / 12);
  const m = months % 12;
  return y > 0 ? `${y}a ${m}m` : `${m}m`;
};

const comissColor = (status: string | null) => {
  if (!status) return 'default' as const;
  if (status === 'OK') return 'success' as const;
  if (status === 'VENCIDO') return 'error' as const;
  return 'warning' as const;
};

export function PatrimonioDataGrid({ rows, isLoading }: PatrimonioDataGridProps) {
  const navigate = useNavigate();

  const columns = useMemo<GridColDef<PatrimonioBemListItem>[]>(
    () => [
      {
        field: 'tag',
        headerName: 'TAG',
        width: 120,
        renderCell: (params) => (
          <span style={{ fontWeight: 700 }}>
            {params.value || params.row.codbem}
          </span>
        ),
      },
      { field: 'placa', headerName: 'Placa', width: 100 },
      { field: 'descricaoAbreviada', headerName: 'Descricao', width: 200 },
      {
        field: 'categoria',
        headerName: 'Categoria',
        width: 150,
        renderCell: (params) => (
          <Chip label={params.value} size="small" />
        ),
      },
      {
        field: 'mobilizado',
        headerName: 'Status',
        width: 130,
        renderCell: (params) => (
          <Chip
            label={params.value ? 'MOBILIZADO' : 'DISPONIVEL'}
            size="small"
            sx={{
              backgroundColor: params.value ? '#ed6c02' : '#2e7d32',
              color: '#fff',
            }}
          />
        ),
      },
      { field: 'clienteAtual', headerName: 'Cliente', width: 200 },
      {
        field: 'vlrAquisicao',
        headerName: 'Valor Aquisicao',
        width: 140,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) =>
          typeof params.value === 'number' ? fmtCurrency(params.value) : '-',
      },
      {
        field: 'vlrDepreciacao',
        headerName: 'Depreciacao',
        width: 130,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) =>
          typeof params.value === 'number' ? fmtCurrency(params.value) : '-',
      },
      {
        field: 'idadeMeses',
        headerName: 'Idade',
        width: 90,
        renderCell: (params) => fmtAge(params.value as number | null),
      },
      {
        field: 'statusComissionamento',
        headerName: 'Comiss.',
        width: 140,
        renderCell: (params) => {
          const status = params.value as string | null;
          if (!status) return '-';
          return <Chip label={status} size="small" color={comissColor(status)} />;
        },
      },
      {
        field: 'temPatrimonio',
        headerName: 'Pat.',
        width: 60,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) =>
          params.value ? (
            <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
          ) : (
            <CancelIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
          ),
      },
    ],
    [],
  );

  const handleRowClick = useCallback(
    (params: GridRowParams<PatrimonioBemListItem>) => {
      const codprod = params.row.codprod ? `?codprod=${params.row.codprod}` : '';
      navigate(`/patrimonio/bem/${encodeURIComponent(params.row.codbem)}${codprod}`);
    },
    [navigate],
  );

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={isLoading}
      getRowId={(row) => `${row.codbem}-${row.codprod}-${row.codveiculo ?? 0}`}
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
