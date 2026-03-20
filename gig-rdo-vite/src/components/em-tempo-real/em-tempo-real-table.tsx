import { useMemo, useState } from 'react';
import { Box, Chip, Typography, TextField, InputAdornment } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Search } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { EmTempoRealItem } from '@/types/em-tempo-real-types';

const statusColors: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  A: 'info',
  L: 'success',
  P: 'warning',
};

const estoqueColors: Record<string, 'error' | 'success' | 'default' | 'secondary'> = {
  B: 'error',
  E: 'success',
  N: 'default',
  R: 'secondary',
};

const columns: GridColDef<EmTempoRealItem>[] = [
  {
    field: 'NOME_USUARIO',
    headerName: 'Usuario',
    width: 220,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
        <FuncionarioAvatar
          codparc={row.CODPARC_USUARIO}
          nome={row.NOME_USUARIO || ''}
          size="small"
        />
        <Typography variant="body2" noWrap>
          {row.NOME_USUARIO || '-'}
        </Typography>
      </Box>
    ),
  },
  {
    field: 'NUNOTA',
    headerName: 'Nota Unica',
    width: 110,
    type: 'number',
  },
  {
    field: 'NUMERO_NOTA',
    headerName: 'Num. Nota',
    width: 100,
    type: 'number',
  },
  {
    field: 'DATA_HORA_MOVIMENTO',
    headerName: 'Data/Hora Mov.',
    width: 160,
  },
  {
    field: 'STATUS_DESCRICAO',
    headerName: 'Status',
    width: 130,
    renderCell: ({ row }) => (
      <Chip
        label={row.STATUS_DESCRICAO}
        color={statusColors[row.STATUS_CODIGO] ?? 'default'}
        size="small"
        variant="filled"
      />
    ),
  },
  {
    field: 'DESCRICAO_TIPO_OPER',
    headerName: 'Tipo Operacao',
    width: 200,
    valueGetter: (_v, row) => row.DESCRICAO_TIPO_OPER || '-',
  },
  {
    field: 'DESCRICAO_ATUALIZA_ESTOQUE',
    headerName: 'Estoque',
    width: 170,
    renderCell: ({ row }) => (
      <Chip
        label={row.DESCRICAO_ATUALIZA_ESTOQUE}
        color={estoqueColors[row.COD_ATUALIZA_ESTOQUE ?? ''] ?? 'default'}
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    field: 'PARCEIRO_NOME',
    headerName: 'Parceiro',
    width: 200,
    valueGetter: (_v, row) => row.PARCEIRO_NOME || '-',
  },
  {
    field: 'EMPRESA',
    headerName: 'Empresa',
    width: 90,
    type: 'number',
  },
  {
    field: 'VALOR_NOTA',
    headerName: 'Valor',
    width: 130,
    type: 'number',
    valueFormatter: (v: number | null) =>
      v != null
        ? new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(v)
        : '-',
  },
  {
    field: 'NUNOTA_ORIGEM',
    headerName: 'Nota Origem',
    width: 110,
    type: 'number',
    valueGetter: (_v, row) => row.NUNOTA_ORIGEM || '-',
  },
];

interface EmTempoRealTableProps {
  data: EmTempoRealItem[];
  isLoading: boolean;
  onRowClick?: (nunota: number) => void;
}

export function EmTempoRealTable({ data, isLoading, onRowClick }: EmTempoRealTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(
      (r) =>
        r.NOME_USUARIO?.toLowerCase().includes(q) ||
        r.PARCEIRO_NOME?.toLowerCase().includes(q) ||
        r.DESCRICAO_TIPO_OPER?.toLowerCase().includes(q) ||
        String(r.NUNOTA).includes(q) ||
        String(r.NUMERO_NOTA).includes(q),
    );
  }, [data, search]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        size="small"
        placeholder="Buscar por usuario, parceiro, nota..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ maxWidth: 400 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <DataGrid
        rows={filtered}
        columns={columns}
        loading={isLoading}
        getRowId={(row) =>
          `${row.NUNOTA}-${row.SEQUENCIA}-${row.NUNOTA_ORIGEM ?? 0}-${row.SEQUENCIA_ORIGEM ?? 0}`
        }
        density="compact"
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          sorting: { sortModel: [{ field: 'NUNOTA', sort: 'desc' }] },
        }}
        disableRowSelectionOnClick
        onRowClick={(params) => onRowClick?.(params.row.NUNOTA)}
        sx={{
          height: 600,
          '& .MuiDataGrid-row': { cursor: onRowClick ? 'pointer' : 'default' },
        }}
      />
    </Box>
  );
}
