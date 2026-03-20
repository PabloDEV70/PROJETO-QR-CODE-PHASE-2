import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Chip, Link, Tooltip, Typography } from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import { dataGridPtBR } from '@/utils/datagrid-locale';
import { OsCellChip } from '@/components/rdo/os-cell-chip';
import type { RdoListItem, RdoListResponse } from '@/types/rdo-types';

export interface RdoDataGridProps {
  data?: RdoListResponse;
  isLoading: boolean;
  page: number;
  pageSize: number;
  onPaginationChange: (model: GridPaginationModel) => void;
  onOsClick?: (nuos: number) => void;
}

function fmtDate(dtref: string | null): string {
  if (!dtref) return '-';
  const d = dtref.split('T')[0];
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
}

function buildColumns(
  nav: ReturnType<typeof useNavigate>,
  onOsClick?: (nuos: number) => void,
): GridColDef<RdoListItem>[] {
  return [
    {
      field: 'CODRDO', headerName: 'RDO', width: 72, type: 'number',
      renderCell: ({ row }) => (
        <Link
          component="button" underline="hover" fontWeight="bold"
          sx={{ cursor: 'pointer' }}
          onClick={() => nav(`/rdo/${row.CODRDO}`)}
        >
          {row.CODRDO}
        </Link>
      ),
    },
    {
      field: 'DTREF', headerName: 'Data', width: 90,
      valueGetter: (_v, row) => fmtDate(row.DTREF),
    },
    { field: 'nomeparc', headerName: 'Colaborador', flex: 1, minWidth: 140 },
    {
      field: 'totalItens', headerName: 'Itens', width: 55, type: 'number',
      description: 'Total de apontamentos neste RDO',
    },
    {
      field: 'totalHoras', headerName: 'Horas', width: 60, type: 'number',
      description: 'Total de horas trabalhadas',
      valueFormatter: (v: number) => v ? `${Number(v).toFixed(1)}h` : '-',
    },
    {
      field: 'produtividadePercent', headerName: 'Prod%', width: 68, type: 'number',
      description: 'Produtividade: minutos produtivos / meta efetiva',
      renderCell: ({ row }) => {
        const pct = row.produtividadePercent;
        if (pct == null) return '-';
        const color = pct >= 95 ? '#2e7d32' : pct >= 70 ? '#ed6c02' : '#d32f2f';
        return (
          <Tooltip
            arrow title={
              <span style={{ whiteSpace: 'pre-line' }}>
                {`Produtividade: ${pct.toFixed(0)}%\nProdutivo: ${row.minutosProdu}min\nMeta efetiva: ${row.metaEfetivaMin}min\n${row.atingiuMeta ? 'Meta atingida' : 'Meta nao atingida'}`}
              </span>
            }
          >
            <Typography
              variant="caption" fontWeight={700}
              sx={{ color, fontFamily: 'monospace' }}
            >
              {pct.toFixed(0)}%
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'diagnostico', headerName: 'Diagnostico', width: 110,
      description: 'Faixa de desempenho baseada na produtividade',
      renderCell: ({ row }) => {
        const diag = row.diagnostico;
        if (!diag) return '-';
        const f = row.diagnosticoFaixa?.faixa;
        return (
          <Tooltip arrow title={diag}>
            <Chip
              label={diag} size="small"
              color={(f?.color as 'success' | 'warning' | 'error') ?? 'error'} variant="outlined"
              sx={{ height: 22, fontSize: '0.7rem' }}
            />
          </Tooltip>
        );
      },
    },
    {
      field: 'primeiroNuos', headerName: 'OS', width: 170,
      description: 'Ordens de Servico vinculadas a este RDO',
      renderCell: ({ row }) => (
        <OsCellChip
          row={row}
          onClick={
            row.primeiroNuos
              ? () => onOsClick?.(row.primeiroNuos!)
              : undefined
          }
        />
      ),
    },
    {
      field: 'veiculoPlaca', headerName: 'Veiculo', width: 90,
      description: 'Placa do veiculo associado',
      renderCell: ({ row }) => {
        if (!row.veiculoPlaca) return <Typography variant="caption" color="text.disabled">-</Typography>;
        return (
          <Tooltip
            arrow title={
              [row.veiculoPlaca, row.veiculoTag, row.veiculoModelo]
                .filter(Boolean).join(' | ')
            }
          >
            <Typography variant="caption" fontWeight={600} noWrap>
              {row.veiculoPlaca}
            </Typography>
          </Tooltip>
        );
      },
    },
  ];
}

export function RdoDataGrid({
  data, isLoading, page, pageSize, onPaginationChange, onOsClick,
}: RdoDataGridProps) {
  const nav = useNavigate();
  const columns = useMemo(() => buildColumns(nav, onOsClick), [nav, onOsClick]);
  const rows = data?.data || [];
  const total = data?.meta?.totalRegistros || 0;

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        getRowId={(r) => r.CODRDO}
        paginationMode="server"
        rowCount={total}
        paginationModel={{ page: page - 1, pageSize }}
        onPaginationModelChange={(m) =>
          onPaginationChange({ page: m.page + 1, pageSize: m.pageSize })
        }
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
        density="compact"
        rowHeight={44}
        localeText={dataGridPtBR}
        sx={{
          bgcolor: 'background.paper', borderRadius: 2,
          minHeight: 400,
          '& .MuiDataGrid-cell': { fontSize: '0.8rem' },
          '& .MuiDataGrid-columnHeader': { fontSize: '0.75rem' },
        }}
        slotProps={{
          loadingOverlay: { variant: 'linear-progress' as const },
        }}
      />
    </Box>
  );
}
