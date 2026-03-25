import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, Stack, alpha,
} from '@mui/material';
import {
  DataGrid, type GridColDef,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv, ExportPrint,
  QuickFilter, QuickFilterControl, QuickFilterTrigger,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import {
  ViewColumn, FilterList, FileDownload, Print,
} from '@mui/icons-material';
import { useEmTempoRealMovimentacoes } from '@/hooks/use-em-tempo-real';
import { PageLayout } from '@/components/layout/page-layout';

const STATUS_COLORS: Record<string, string> = {
  A: '#1565c0', L: '#2e7d32', P: '#ed6c02', C: '#d32f2f',
};
const STATUS_LABELS: Record<string, string> = {
  A: 'Atendimento', L: 'Liberada', P: 'Pendente', C: 'Cancelada',
};
const EST_COLORS: Record<string, string> = {
  B: '#d32f2f', E: '#2e7d32', N: '#9e9e9e', R: '#7b1fa2',
};

function fmtCurrency(val: number | null): string {
  if (val == null) return '-';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDateTime(val: string | null): string {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const LOCALE = { ...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhuma movimentacao encontrada' };

export function CabsPorTopPage() {
  const { data, isLoading } = useEmTempoRealMovimentacoes();
  const navigate = useNavigate();

  const rows = useMemo(() => {
    if (!data) return [];
    return data.map((item, idx) => ({
      id: `${item.NUNOTA}-${item.SEQUENCIA}-${idx}`,
      ...item,
    }));
  }, [data]);

  // Resumo por TOP
  const topResumo = useMemo(() => {
    const map = new Map<string, { count: number; valor: number }>();
    for (const r of rows) {
      const key = r.DESCRICAO_TIPO_OPER || 'Sem TOP';
      const prev = map.get(key) || { count: 0, valor: 0 };
      map.set(key, { count: prev.count + 1, valor: prev.valor + (r.VALOR_NOTA || 0) });
    }
    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);
  }, [rows]);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'NUNOTA', headerName: 'Nota Unica', width: 100,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: 'primary.main', cursor: 'pointer' }}>
          {value}
        </Typography>
      ),
    },
    {
      field: 'NUMERO_NOTA', headerName: 'Num. Nota', width: 90,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontFamily: 'monospace' }}>{value || '-'}</Typography>,
    },
    {
      field: 'STATUS_DESCRICAO', headerName: 'Status', width: 120,
      renderCell: ({ row }) => {
        const color = STATUS_COLORS[row.STATUS_CODIGO] || '#9e9e9e';
        return <Chip label={row.STATUS_DESCRICAO} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, bgcolor: alpha(color, 0.1), color }} />;
      },
    },
    {
      field: 'DESCRICAO_TIPO_OPER', headerName: 'Tipo Operacao (TOP)', width: 220,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.disabled' }}>{row.CODIGO_TIPO_OPER}</Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{row.DESCRICAO_TIPO_OPER}</Typography>
        </Stack>
      ),
    },
    {
      field: 'DESCRICAO_ATUALIZA_ESTOQUE', headerName: 'Estoque', width: 120,
      renderCell: ({ row }) => {
        const color = EST_COLORS[row.COD_ATUALIZA_ESTOQUE] || '#9e9e9e';
        return <Chip label={row.DESCRICAO_ATUALIZA_ESTOQUE || '-'} size="small" variant="outlined" sx={{ height: 20, fontSize: 10, fontWeight: 600, borderColor: color, color }} />;
      },
    },
    {
      field: 'PARCEIRO_NOME', headerName: 'Parceiro', flex: 1, minWidth: 180,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 12 }}>{value || '-'}</Typography>,
    },
    {
      field: 'NOME_USUARIO', headerName: 'Usuario', width: 130,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{value || '-'}</Typography>,
    },
    {
      field: 'DATA_HORA_MOVIMENTO', headerName: 'Data/Hora', width: 130,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11, fontFamily: 'monospace' }}>{fmtDateTime(value as string)}</Typography>,
    },
    {
      field: 'EMPRESA', headerName: 'Emp', width: 50, align: 'center', headerAlign: 'center',
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11, fontFamily: 'monospace' }}>{value}</Typography>,
    },
    {
      field: 'VALOR_NOTA', headerName: 'Valor', width: 120, align: 'right', headerAlign: 'right',
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color: (value as number) > 0 ? 'success.main' : 'text.disabled' }}>
          {fmtCurrency(value as number)}
        </Typography>
      ),
    },
  ], []);

  return (
    <PageLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {/* Resumo por TOP no topo */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { height: 4 } }}>
            {topResumo.slice(0, 12).map(([top, { count, valor }]) => (
              <Chip
                key={top}
                label={`${top} (${count}) ${fmtCurrency(valor)}`}
                size="small"
                sx={{ fontSize: 10, fontWeight: 600, height: 24, flexShrink: 0 }}
              />
            ))}
          </Stack>
        </Box>

        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          density="compact"
          rowHeight={44}
          disableRowSelectionOnClick
          showToolbar
          onRowClick={(params) => navigate(`/em-tempo-real/${params.row.NUNOTA}`)}
          pageSizeOptions={[25, 50, 100, 200]}
          initialState={{
            pagination: { paginationModel: { pageSize: 100 } },
            sorting: { sortModel: [{ field: 'DATA_HORA_MOVIMENTO', sort: 'desc' }] },
          }}
          localeText={LOCALE}
          slots={{
            toolbar: () => (
              <Toolbar>
                <Typography fontWeight={700} fontSize={14} sx={{ mr: 1 }}>CABS por TOP</Typography>
                <Chip label={`${rows.length} movimentacoes`} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, mr: 1 }} />
                <Box sx={{ flex: 1 }} />
                <QuickFilter>
                  <QuickFilterTrigger render={(props, state) => (
                    <ToolbarButton {...props} color="default">{state.expanded ? 'X' : '🔍'}</ToolbarButton>
                  )} />
                  <QuickFilterControl render={({ ref, ...props }) => (
                    <input ref={ref} {...props} placeholder="Buscar..." style={{ border: '1px solid #ccc', borderRadius: 4, padding: '4px 8px', fontSize: 12, width: 200 }} />
                  )} />
                </QuickFilter>
                <ColumnsPanelTrigger render={<ToolbarButton />}><ViewColumn fontSize="small" /></ColumnsPanelTrigger>
                <FilterPanelTrigger render={<ToolbarButton />}><FilterList fontSize="small" /></FilterPanelTrigger>
                <ExportCsv render={<ToolbarButton />}><FileDownload fontSize="small" /></ExportCsv>
                <ExportPrint render={<ToolbarButton />}><Print fontSize="small" /></ExportPrint>
              </Toolbar>
            ),
          }}
          sx={{
            flex: 1, border: 0,
            '& .MuiDataGrid-columnHeaders': { '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12 } },
            '& .MuiDataGrid-row': { cursor: 'pointer', '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) } },
            '& .MuiDataGrid-cell': { fontSize: 12, borderColor: 'divider' },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
          }}
        />
      </Box>
    </PageLayout>
  );
}
