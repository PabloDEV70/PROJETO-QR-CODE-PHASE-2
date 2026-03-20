import { useMemo } from 'react';
import {
  DataGrid,
  type GridColDef,
  type GridSortModel,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import { Stack, Tooltip, Typography } from '@mui/material';
import { CheckCircleOutline, MeetingRoom } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { SituacaoBadge } from '@/components/funcionarios/situacao-badge';
import type { FuncionarioListaItem } from '@/types/funcionario-types';

interface FuncionariosDataGridProps {
  rows: FuncionarioListaItem[];
  rowCount: number;
  isLoading: boolean;
  page: number;
  pageSize: number;
  orderBy: string;
  orderDir: 'ASC' | 'DESC';
  onRowClick: (codparc: number) => void;
  onPaginationChange: (page: number, pageSize: number) => void;
  onSortChange: (field: string, dir: 'ASC' | 'DESC') => void;
}

function fmtDate(val: string | null | undefined): string {
  if (!val) return '-';
  return new Date(val).toLocaleDateString('pt-BR');
}

function fmtCpf(val: string | null | undefined): string {
  if (!val) return '-';
  const digits = val.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  return val;
}

function fmtTempoEmpresa(dias: number | null | undefined): string {
  if (dias == null || dias < 0) return '-';
  const anos = Math.floor(dias / 365);
  const meses = Math.floor((dias % 365) / 30);
  if (anos > 0 && meses > 0) return `${anos}a ${meses}m`;
  if (anos > 0) return `${anos}a`;
  if (meses > 0) return `${meses}m`;
  return `${dias}d`;
}

function NomeCell({ row }: { row: FuncionarioListaItem }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
      <FuncionarioAvatar
        codparc={row.codparc}
        nome={row.nomeparc}
        showFoto={row.temFoto}
        size="small"
      />
      <Stack sx={{ overflow: 'hidden', minWidth: 0 }}>
        <Typography sx={{
          fontSize: 12.5, fontWeight: 500, lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {row.nomeparc}
        </Typography>
        {row.empresa && (
          <Typography sx={{
            fontSize: 10.5, color: '#94a3b8', lineHeight: 1.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {row.empresa}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

export function FuncionariosDataGrid({
  rows, rowCount, isLoading, page, pageSize,
  orderBy, orderDir, onRowClick, onPaginationChange, onSortChange,
}: FuncionariosDataGridProps) {
  const columns: GridColDef<FuncionarioListaItem>[] = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      sortable: false,
      valueGetter: (_value: unknown, row: FuncionarioListaItem) =>
        `${row.codemp}-${row.codfunc}`,
    },
    {
      field: 'nomeparc',
      headerName: 'Nome',
      flex: 1,
      minWidth: 240,
      renderCell: ({ row }) => <NomeCell row={row} />,
    },
    {
      field: 'cgcCpf',
      headerName: 'CPF',
      width: 140,
      valueFormatter: (value: string | null) => fmtCpf(value),
    },
    {
      field: 'situacao',
      headerName: 'Situacao',
      width: 130,
      renderCell: ({ row }) => (
        <SituacaoBadge situacao={row.situacao} label={row.situacaoLabel} />
      ),
    },
    { field: 'departamento', headerName: 'Departamento', width: 180 },
    {
      field: 'cargo',
      headerName: 'Cargo',
      width: 220,
      renderCell: ({ value }) => (
        <Tooltip title={value || ''} arrow placement="top">
          <Typography sx={{
            fontSize: 12.5, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {value || '-'}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'dtadm',
      headerName: 'Admissao',
      width: 110,
      valueFormatter: (value: string | null) => fmtDate(value),
    },
    {
      field: 'idade',
      headerName: 'Idade',
      width: 70,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value: number | null) => value != null ? `${value}` : '-',
    },
    {
      field: 'diasNaEmpresa',
      headerName: 'Tempo Empresa',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value: number | null) => fmtTempoEmpresa(value),
    },
    {
      field: 'temUsuario',
      headerName: 'Usuario',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => value ? (
        <CheckCircleOutline sx={{ fontSize: 18, color: '#2e7d32' }} />
      ) : null,
    },
    {
      field: 'temArmario',
      headerName: 'Armario',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => value ? (
        <Tooltip title="Possui armario" arrow>
          <MeetingRoom sx={{ fontSize: 18, color: '#2e7d32' }} />
        </Tooltip>
      ) : null,
    },
  ], []);

  const sortModel: GridSortModel = orderBy
    ? [{ field: orderBy, sort: orderDir === 'ASC' ? 'asc' : 'desc' }]
    : [];

  const paginationModel: GridPaginationModel = {
    page: page - 1,
    pageSize,
  };

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => `${row.codemp}-${row.codfunc}`}
      loading={isLoading}
      rowCount={rowCount}
      paginationMode="server"
      sortingMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={(m) => onPaginationChange(m.page + 1, m.pageSize)}
      sortModel={sortModel}
      onSortModelChange={(m) => {
        if (m.length > 0 && m[0] && m[0].sort) {
          onSortChange(m[0].field, m[0].sort === 'asc' ? 'ASC' : 'DESC');
        }
      }}
      onRowClick={({ row }) => onRowClick(row.codparc)}
      pageSizeOptions={[10, 25, 50, 100]}
      rowHeight={48}
      density="compact"
      disableRowSelectionOnClick
      disableColumnFilter
      sx={{
        border: 0,
        cursor: 'pointer',
        '& .MuiDataGrid-cell': { fontSize: 12.5 },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 700, fontSize: 12, letterSpacing: '-0.01em',
        },
      }}
      autoHeight
      slotProps={{
        toolbar: { showQuickFilter: false },
      }}
    />
  );
}
