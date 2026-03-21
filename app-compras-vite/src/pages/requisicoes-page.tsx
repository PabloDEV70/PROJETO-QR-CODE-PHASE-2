import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Chip, Stack, alpha } from '@mui/material';
import {
  DataGrid, type GridColDef,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { ViewColumn, FilterList, FileDownload, Refresh } from '@mui/icons-material';
import { useRequisicoesPendentes } from '@/hooks/use-compras';
import { PRIORIDADE_COLORS } from '@/types/compras-types';
import type { RequisicaoItem } from '@/types/compras-types';

const LOCALE = {
  ...ptBR.components.MuiDataGrid.defaultProps.localeText,
  noRowsLabel: 'Nenhuma requisicao encontrada',
};

function getDiasColor(dias: number | null): string {
  if (dias === null) return '#9e9e9e';
  if (dias < 0) return '#000000';
  if (dias <= 1) return '#d32f2f';
  if (dias <= 2) return '#e65100';
  if (dias <= 5) return '#1565c0';
  return '#4caf50';
}

function ReqToolbar({ total, onRefresh }: { total: number; onRefresh: () => void }) {
  return (
    <Toolbar>
      <Typography fontWeight={700} fontSize={14} sx={{ mr: 1 }}>Requisicoes Pendentes</Typography>
      <Chip label={total} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700 }} />
      <Box sx={{ flex: 1 }} />
      <ToolbarButton onClick={onRefresh}><Refresh fontSize="small" /></ToolbarButton>
      <ColumnsPanelTrigger render={<ToolbarButton />}><ViewColumn fontSize="small" /></ColumnsPanelTrigger>
      <FilterPanelTrigger render={(fp) => (
        <ToolbarButton {...fp}><FilterList fontSize="small" /></ToolbarButton>
      )} />
      <ExportCsv render={<ToolbarButton />}><FileDownload fontSize="small" /></ExportCsv>
    </Toolbar>
  );
}

export function RequisicoesPage() {
  const { pathname } = useLocation();
  const tipo = pathname.includes('manutencao') ? 'manutencao' as const : 'compras' as const;
  const { data, isLoading, refetch } = useRequisicoesPendentes(tipo);

  const columns: GridColDef<RequisicaoItem>[] = useMemo(() => [
    { field: 'NUNOTA', headerName: 'Nota', width: 80, type: 'number' },
    {
      field: 'DESCRPROD', headerName: 'Produto', flex: 1, minWidth: 200,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }} noWrap>{row.DESCRPROD}</Typography>
          {row.CODPROD && <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>#{row.CODPROD}</Typography>}
        </Box>
      ),
    },
    {
      field: 'APLICACAO', headerName: 'Aplicacao', width: 140,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500 }} noWrap>{row.APLICACAO ?? '-'}</Typography>
          {row.MARCAMODELO && <Typography sx={{ fontSize: 10, color: 'text.disabled' }} noWrap>{row.MARCAMODELO}</Typography>}
        </Box>
      ),
    },
    {
      field: 'PRIORIDADE', headerName: 'Prioridade', width: 140,
      renderCell: ({ value }) => {
        if (!value) return '-';
        const color = PRIORIDADE_COLORS[value as string] ?? '#757575';
        return (
          <Chip
            label={value as string} size="small"
            sx={{ fontSize: 10, height: 22, fontWeight: 700, bgcolor: alpha(color, 0.12), color, border: `1px solid ${alpha(color, 0.3)}` }}
          />
        );
      },
    },
    {
      field: 'CONTROLE_DIAS', headerName: 'Dias', width: 70, type: 'number', align: 'right', headerAlign: 'right',
      renderCell: ({ value }) => {
        const dias = value as number | null;
        const color = getDiasColor(dias);
        return (
          <Typography sx={{ fontSize: 13, fontWeight: 800, color, fontFamily: 'monospace' }}>
            {dias ?? '-'}
          </Typography>
        );
      },
    },
    { field: 'QTDPENDENTE', headerName: 'Qtd Pend', width: 85, type: 'number', align: 'right', headerAlign: 'right' },
    { field: 'NOMEUSU', headerName: 'Solicitante', width: 140 },
    { field: 'DTNEG', headerName: 'Data Neg', width: 95 },
    { field: 'DTLIMITE', headerName: 'Limite', width: 95 },
    {
      field: 'OBSERVACAO', headerName: 'Observacao', width: 200,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }} noWrap>{(value as string) ?? '-'}</Typography>
      ),
    },
    { field: 'CONTROLE', headerName: 'Controle', width: 90 },
  ], []);

  const toolbarProps = useMemo(() => ({
    total: data?.length ?? 0,
    onRefresh: () => refetch(),
  }), [data?.length, refetch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
            {tipo === 'manutencao' ? 'Requisicoes Manutencao' : 'Requisicoes Compras'}
          </Typography>
          <Chip label={tipo === 'manutencao' ? 'CODTIPOPER 57' : 'CODTIPOPER 502-507'} size="small" variant="outlined" sx={{ fontSize: 10 }} />
        </Stack>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={data ?? []}
          columns={columns}
          getRowId={(r) => `${r.NUNOTA}-${r.CODPROD}-${r.CONTROLE}`}
          loading={isLoading}
          rowHeight={52}
          disableRowSelectionOnClick
          showToolbar
          slots={{ toolbar: ReqToolbar as never }}
          slotProps={{ toolbar: toolbarProps as never }}
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
          localeText={LOCALE}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12 },
            },
            '& .MuiDataGrid-row:nth-of-type(even)': {
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
            },
            '& .MuiDataGrid-cell': { fontSize: 13 },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': { outline: 'none' },
          }}
        />
      </Box>
    </Box>
  );
}
