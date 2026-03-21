import { useMemo } from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import {
  DataGrid, type GridColDef,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { ViewColumn, FilterList, FileDownload, Refresh } from '@mui/icons-material';
import { useCotacoesPendentes } from '@/hooks/use-compras';
import type { CotacaoItem } from '@/types/compras-types';

const LOCALE = {
  ...ptBR.components.MuiDataGrid.defaultProps.localeText,
  noRowsLabel: 'Nenhuma cotacao encontrada',
};

function CotToolbar({ total, onRefresh }: { total: number; onRefresh: () => void }) {
  return (
    <Toolbar>
      <Typography fontWeight={700} fontSize={14} sx={{ mr: 1 }}>Cotacoes Pendentes</Typography>
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

function fmtDate(val: string | null): string {
  if (!val) return '-';
  const d = new Date(val);
  return isNaN(d.getTime()) ? val : d.toLocaleDateString('pt-BR');
}

export function CotacoesPage() {
  const { data, isLoading, refetch } = useCotacoesPendentes();

  const columns: GridColDef<CotacaoItem>[] = useMemo(() => [
    { field: 'NUMCOTACAO', headerName: 'Cotacao', width: 100, type: 'number' },
    { field: 'COMPRADOR', headerName: 'Comprador', flex: 1, minWidth: 180 },
    {
      field: 'SITUACAO', headerName: 'Situacao', width: 120,
      renderCell: ({ value }) => {
        const s = value as string | null;
        return <Chip label={s ?? '-'} size="small" variant="outlined" sx={{ fontSize: 11, fontWeight: 600 }} />;
      },
    },
    { field: 'QTD_NOTAS', headerName: 'Notas', width: 80, type: 'number', align: 'right', headerAlign: 'right' },
    {
      field: 'DHINIC', headerName: 'Data Inicio', width: 110,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 12 }}>{fmtDate(value as string)}</Typography>,
    },
  ], []);

  const toolbarProps = useMemo(() => ({
    total: data?.length ?? 0,
    onRefresh: () => refetch(),
  }), [data?.length, refetch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Cotacoes</Typography>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={data ?? []}
          columns={columns}
          getRowId={(r) => r.NUMCOTACAO}
          loading={isLoading}
          rowHeight={48}
          disableRowSelectionOnClick
          showToolbar
          slots={{ toolbar: CotToolbar as never }}
          slotProps={{ toolbar: toolbarProps as never }}
          pageSizeOptions={[25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          localeText={LOCALE}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12 },
            },
            '& .MuiDataGrid-cell': { fontSize: 13 },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': { outline: 'none' },
          }}
        />
      </Box>
    </Box>
  );
}
