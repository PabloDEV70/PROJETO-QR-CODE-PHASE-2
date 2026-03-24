import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Chip, Stack, alpha } from '@mui/material';
import {
  DataGrid, type GridColDef,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { ViewColumn, FilterList, FileDownload, Refresh, Warning } from '@mui/icons-material';
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

function ReqToolbar({ total, vencidos, onRefresh }: { total: number; vencidos: number; onRefresh: () => void }) {
  return (
    <Toolbar>
      <Typography fontWeight={700} fontSize={14} sx={{ mr: 1 }}>Requisicoes Pendentes</Typography>
      <Chip label={`${total} itens`} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, mr: 0.5 }} />
      {vencidos > 0 && (
        <Chip
          icon={<Warning sx={{ fontSize: '12px !important' }} />}
          label={`${vencidos} vencidos`}
          size="small"
          sx={{ height: 22, fontSize: 11, fontWeight: 700, bgcolor: alpha('#d32f2f', 0.08), color: '#d32f2f', '& .MuiChip-icon': { color: '#d32f2f' } }}
        />
      )}
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

  const vencidos = useMemo(() => (data ?? []).filter((r) => (r.CONTROLE_DIAS ?? 99) < 0).length, [data]);

  const columns: GridColDef<RequisicaoItem>[] = useMemo(() => [
    { field: 'NUNOTA', headerName: 'Nota', width: 80, type: 'number' },
    {
      field: 'DESCRPROD', headerName: 'Produto', flex: 1, minWidth: 220,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }} noWrap>{row.DESCRPROD}</Typography>
          {row.CODPROD && <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>#{row.CODPROD}</Typography>}
        </Box>
      ),
    },
    {
      field: 'APLICACAO', headerName: 'Veiculo / Aplicacao', width: 160,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, fontFamily: row.CODVEICULO ? 'monospace' : undefined }} noWrap>
            {row.APLICACAO ?? '-'}
          </Typography>
          {row.VEICULOTAG && <Typography sx={{ fontSize: 11, color: 'primary.main', fontWeight: 600 }}>{row.VEICULOTAG}</Typography>}
          {row.MARCAMODELO && <Typography sx={{ fontSize: 10, color: 'text.disabled' }} noWrap>{row.MARCAMODELO}</Typography>}
        </Box>
      ),
    },
    {
      field: 'PRIORIDADE', headerName: 'Prioridade', width: 160,
      renderCell: ({ row }) => {
        if (!row.PRIORIDADE) return '-';
        const color = PRIORIDADE_COLORS[row.PRIORIDADE] ?? '#757575';
        return (
          <Stack spacing={0.25}>
            <Chip label={row.PRIORIDADE} size="small"
              sx={{ fontSize: 10, height: 22, fontWeight: 700, bgcolor: alpha(color, 0.12), color, border: `1px solid ${alpha(color, 0.3)}` }} />
            {row.PRAZO && <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>{row.PRAZO}</Typography>}
          </Stack>
        );
      },
    },
    {
      field: 'CONTROLE_DIAS', headerName: 'Dias', width: 75, type: 'number', align: 'center', headerAlign: 'center',
      renderCell: ({ value }) => {
        const dias = value as number | null;
        const color = getDiasColor(dias);
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 900, color, fontFamily: 'monospace', lineHeight: 1 }}>
              {dias ?? '-'}
            </Typography>
            <Typography sx={{ fontSize: 9, color: 'text.disabled' }}>dias</Typography>
          </Box>
        );
      },
    },
    {
      field: 'QTDPENDENTE', headerName: 'Qtd', width: 70, type: 'number', align: 'center', headerAlign: 'center',
      renderCell: ({ row }) => (
        <Typography sx={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace' }}>
          {row.QTDPENDENTE}
        </Typography>
      ),
    },
    { field: 'NOMEUSU', headerName: 'Solicitante', width: 140 },
    { field: 'DTNEG', headerName: 'Data', width: 90 },
    { field: 'DTLIMITE', headerName: 'Limite', width: 90,
      renderCell: ({ value, row }) => {
        const overdue = (row.CONTROLE_DIAS ?? 99) < 0;
        return (
          <Typography sx={{ fontSize: 12, fontWeight: overdue ? 700 : 400, color: overdue ? '#d32f2f' : 'text.primary' }}>
            {(value as string) ?? '-'}
          </Typography>
        );
      },
    },
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
    vencidos,
    onRefresh: () => refetch(),
  }), [data?.length, vencidos, refetch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
            {tipo === 'manutencao' ? 'Requisicoes Manutencao' : 'Requisicoes Compras'}
          </Typography>
          <Chip label={tipo === 'manutencao' ? 'TOP 57' : 'TOP 502-507'} size="small" variant="outlined" sx={{ fontSize: 10 }} />
        </Stack>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={data ?? []}
          columns={columns}
          getRowId={(r) => `${r.NUNOTA}-${r.CODPROD}-${r.CONTROLE}`}
          loading={isLoading}
          rowHeight={60}
          disableRowSelectionOnClick
          showToolbar
          slots={{ toolbar: ReqToolbar as never }}
          slotProps={{ toolbar: toolbarProps as never }}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 50 } },
            sorting: { sortModel: [{ field: 'CONTROLE_DIAS', sort: 'asc' }] },
          }}
          localeText={LOCALE}
          getRowClassName={(params) => {
            const dias = params.row.CONTROLE_DIAS;
            if (dias !== null && dias < 0) return 'row-vencida';
            if (dias !== null && dias <= 1) return 'row-critica';
            return '';
          }}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12 },
            },
            '& .row-vencida': {
              bgcolor: (t) => alpha(t.palette.error.main, 0.04),
            },
            '& .row-critica': {
              bgcolor: (t) => alpha(t.palette.warning.main, 0.04),
            },
            '& .MuiDataGrid-cell': { fontSize: 13 },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': { outline: 'none' },
          }}
        />
      </Box>
    </Box>
  );
}
