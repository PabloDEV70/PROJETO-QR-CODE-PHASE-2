import { useMemo } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import { getPrioridadeInfo } from '@/utils/prioridade-constants';
import { getStatusInfo } from '@/utils/status-utils';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';
import type { HstVeiRow } from '@/api/hstvei-crud';
import { format, parseISO } from 'date-fns';

interface Props {
  rows: HstVeiRow[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick: (row: HstVeiRow) => void;
}

function fmtDate(dt: string | null | undefined) {
  if (!dt || typeof dt !== 'string') return '';
  try { return format(parseISO(dt), 'dd/MM/yy HH:mm'); } catch { return String(dt); }
}

const columns: GridColDef[] = [
  {
    field: 'placa', headerName: 'Placa', width: 100,
    renderCell: (p) => (
      <Box sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>
        {p.value ?? ''}
      </Box>
    ),
  },
  { field: 'veiculoTag', headerName: 'Tag', width: 90, valueGetter: (_v, row) => row.veiculoTag ?? '' },
  {
    field: 'situacaoDescricao', headerName: 'Situacao', width: 180,
    renderCell: (p) => {
      const info = getStatusInfo(String(p.value ?? ''));
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: info.color, flexShrink: 0 }} />
          <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{String(p.value ?? '')}</Box>
        </Box>
      );
    },
  },
  {
    field: 'departamentoNome', headerName: 'Depto', width: 110,
    renderCell: (p) => {
      const dep = getDepartamentoInfo(p.row.situacaoCoddep);
      return (
        <Chip label={dep.label} size="small"
          sx={{ bgcolor: dep.color, color: '#fff', fontWeight: 600, fontSize: '0.68rem', height: 22 }} />
      );
    },
  },
  {
    field: 'prioridadeSigla', headerName: 'Pri', width: 70,
    renderCell: (p) => {
      const pri = getPrioridadeInfo(p.row.IDPRI);
      return (
        <Box sx={{
          width: 22, height: 22, borderRadius: '50%',
          bgcolor: pri.color + '33', color: pri.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', fontWeight: 700,
        }}>
          {pri.sigla}
        </Box>
      );
    },
  },
  { field: 'DESCRICAO', headerName: 'Descricao', width: 220, valueGetter: (_v, row) => row.DESCRICAO ?? '' },
  {
    field: 'nomeUsuInc', headerName: 'Criado', width: 80, sortable: false,
    renderCell: (p) => {
      const nome = p.row.nomeUsuInc;
      if (!nome) return null;
      return (
        <Tooltip title={`Criado por: ${nome}`}>
          <span>
            <PessoaAvatar nome={nome} size={24} />
          </span>
        </Tooltip>
      );
    },
  },
  { field: 'veiculoTipo', headerName: 'Tipo', width: 130, valueGetter: (_v, row) => row.veiculoTipo ?? '' },
  {
    field: 'DTINICIO', headerName: 'Inicio', width: 120,
    valueGetter: (_v, row) => fmtDate(row.DTINICIO),
  },
  {
    field: 'DTPREVISAO', headerName: 'Previsao', width: 120,
    valueGetter: (_v, row) => fmtDate(row.DTPREVISAO),
  },
  {
    field: 'DTFIM', headerName: 'Encerrado', width: 120,
    valueGetter: (_v, row) => fmtDate(row.DTFIM),
  },
  { field: 'NUOS', headerName: 'OS Man.', width: 75, valueGetter: (_v, row) => row.NUOS ?? '' },
  { field: 'NUMOS', headerName: 'OS Com.', width: 75, valueGetter: (_v, row) => row.NUMOS ?? '' },
  { field: 'NUNOTA', headerName: 'Mov.', width: 75, valueGetter: (_v, row) => row.NUNOTA ?? '' },
  { field: 'nomeParc', headerName: 'Parceiro', width: 150, valueGetter: (_v, row) => row.nomeParc ?? '' },
];

export function HstVeiDataGrid({ rows, loading, total, page, pageSize, onPageChange, onPageSizeChange, onRowClick }: Props) {
  const gridRows = useMemo(() => rows.map((r) => ({ ...r, id: r.ID })), [rows]);

  return (
    <DataGrid
      rows={gridRows}
      columns={columns}
      loading={loading}
      rowCount={total}
      paginationMode="server"
      paginationModel={{ page: page - 1, pageSize }}
      onPaginationModelChange={(m) => {
        if (m.page + 1 !== page) onPageChange(m.page + 1);
        if (m.pageSize !== pageSize) onPageSizeChange(m.pageSize);
      }}
      pageSizeOptions={[25, 50, 100]}
      density="compact"
      disableRowSelectionOnClick
      onRowClick={(p) => onRowClick(p.row as HstVeiRow)}
      initialState={{
        sorting: { sortModel: [{ field: 'DTINICIO', sort: 'desc' }] },
        columns: { columnVisibilityModel: { DTFIM: false } },
      }}
      sx={{
        border: 0, cursor: 'pointer',
        '& .MuiDataGrid-cell': { fontSize: '0.78rem' },
        '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: '0.72rem' },
      }}
    />
  );
}
