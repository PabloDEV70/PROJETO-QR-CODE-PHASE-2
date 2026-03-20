import { Box, Chip, LinearProgress, Tooltip, Typography } from '@mui/material';
import { DataGrid, type GridColDef, type GridComparatorFn } from '@mui/x-data-grid';
import type { EstoqueLocal } from '@/types/local-produto';
import {
  getDisponivel,
  getHealthChipColor,
  getHealthColor,
  getHealthLabel,
  getHealthLevel,
  isDesativado,
} from '@/utils/estoque-health';
import { ProdutoThumb } from '@/components/shared/produto-thumb';

interface EstoqueTableViewProps {
  items: EstoqueLocal[];
  onSelect: (item: EstoqueLocal) => void;
}

const HEALTH_ORDER = { critico: 0, atencao: 1, ok: 2, excesso: 3 };

const healthSortComparator: GridComparatorFn = (v1: unknown, v2: unknown) =>
  (HEALTH_ORDER[v1 as keyof typeof HEALTH_ORDER] ?? 99) -
  (HEALTH_ORDER[v2 as keyof typeof HEALTH_ORDER] ?? 99);

const columns: GridColDef<EstoqueLocal>[] = [
  {
    field: 'foto',
    headerName: '',
    width: 56,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <ProdutoThumb codProd={row.codProd} size={40} />
      </Box>
    ),
  },
  {
    field: 'codProd',
    headerName: 'Código',
    width: 80,
    renderCell: ({ value }) => (
      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
        {value}
      </Typography>
    ),
  },
  {
    field: 'descrProd',
    headerName: 'Produto',
    flex: 1,
    minWidth: 200,
    renderCell: ({ row }) => {
      const desativado = isDesativado(row);
      const nameEl = (
        <Typography
          variant="body2"
          noWrap
          sx={desativado ? { textDecoration: 'line-through', opacity: 0.6 } : undefined}
        >
          {row.descrProd}
        </Typography>
      );
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {row.complDesc
            ? <Tooltip title={row.complDesc}>{nameEl}</Tooltip>
            : nameEl}
          {desativado && (
            <Chip
              label="DESATIVADO"
              size="small"
              color="error"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
        </Box>
      );
    },
  },
  {
    field: 'descrGrupoProd',
    headerName: 'Grupo',
    width: 120,
    valueGetter: (_, row) => row.descrGrupoProd || '',
  },
  {
    field: 'localizacao',
    headerName: 'Localização',
    width: 120,
    valueGetter: (_, row) => row.localizacao || '',
  },
  {
    field: 'health',
    headerName: 'Saúde',
    width: 110,
    sortComparator: healthSortComparator,
    valueGetter: (_, row) => getHealthLevel(row),
    renderCell: ({ row }) => {
      const level = getHealthLevel(row);
      return (
        <Chip
          label={getHealthLabel(level)}
          size="small"
          color={getHealthChipColor(level)}
          sx={{ height: 22, fontSize: '0.7rem' }}
        />
      );
    },
  },
  {
    field: 'controle',
    headerName: 'Controle',
    width: 100,
    renderCell: ({ value }) => (
      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
        {value || '-'}
      </Typography>
    ),
  },
  {
    field: 'estoque',
    headerName: 'Estoque',
    width: 90,
    type: 'number',
    renderCell: ({ row }) => {
      const level = getHealthLevel(row);
      const ref = row.estMax > 0 ? row.estMax : row.estoque * 1.5 || 1;
      const pct = Math.min(100, (row.estoque / ref) * 100);
      return (
        <Box sx={{ width: '100%' }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: getHealthColor(level) }}
          >
            {row.estoque.toLocaleString('pt-BR')}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={pct}
            color={getHealthChipColor(level)}
            sx={{ height: 3, borderRadius: 1, mt: 0.25 }}
          />
        </Box>
      );
    },
  },
  {
    field: 'disponivel',
    headerName: 'Dispon.',
    width: 80,
    type: 'number',
    valueGetter: (_, row) => getDisponivel(row),
    renderCell: ({ row }) => {
      const disp = getDisponivel(row);
      if (disp === row.estoque) return <Typography variant="body2">-</Typography>;
      return (
        <Typography variant="body2">{disp.toLocaleString('pt-BR')}</Typography>
      );
    },
  },
  {
    field: 'reservado',
    headerName: 'Reserv.',
    width: 80,
    type: 'number',
    valueFormatter: (value: number) =>
      value > 0 ? value.toLocaleString('pt-BR') : '-',
  },
  {
    field: 'estMin',
    headerName: 'Mín',
    width: 70,
    type: 'number',
    valueFormatter: (value: number) =>
      value > 0 ? value.toLocaleString('pt-BR') : '-',
  },
  {
    field: 'estMax',
    headerName: 'Máx',
    width: 70,
    type: 'number',
    valueFormatter: (value: number) =>
      value > 0 ? value.toLocaleString('pt-BR') : '-',
  },
];

export function EstoqueTableView({ items, onSelect }: EstoqueTableViewProps) {
  const rowsWithId = items.map((item, idx) => ({ ...item, _idx: idx }));
  return (
    <Box sx={{ flex: 1, minHeight: 0 }}>
    <DataGrid
      rows={rowsWithId}
      columns={columns}
      getRowId={(row) => `${row.codProd}-${row.controle}-${(row as unknown as { _idx: number })._idx}`}
      getRowClassName={({ row }) => (isDesativado(row) ? 'desativado-row' : '')}
      rowHeight={56}
      disableColumnFilter
      disableRowSelectionOnClick
      onRowClick={({ row }) => onSelect(row)}
      sx={{
        border: 'none',
        '& .MuiDataGrid-row': { cursor: 'pointer' },
        '& .MuiDataGrid-cell': { py: 0.5 },
        '& .desativado-row': { bgcolor: 'action.hover', opacity: 0.7 },
      }}
      pageSizeOptions={[25, 50, 100]}
      initialState={{
        pagination: { paginationModel: { pageSize: 50 } },
        sorting: { sortModel: [{ field: 'descrProd', sort: 'asc' }] },
      }}
    />
    </Box>
  );
}
