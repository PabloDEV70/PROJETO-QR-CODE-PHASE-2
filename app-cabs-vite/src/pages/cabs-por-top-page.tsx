import { useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Chip, Stack, alpha, TextField, InputAdornment,
  ToggleButtonGroup, ToggleButton, Divider,
} from '@mui/material';
import {
  Search, ViewColumn, FilterList, FileDownload,
} from '@mui/icons-material';
import {
  DataGrid, type GridColDef,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv, ExportPrint,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { useEmTempoRealMovimentacoes } from '@/hooks/use-em-tempo-real';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

const STATUS_COLORS: Record<string, string> = {
  A: '#1565c0', L: '#2e7d32', P: '#ed6c02', C: '#d32f2f',
};
const EST_COLORS: Record<string, string> = {
  B: '#d32f2f', E: '#2e7d32', N: '#9e9e9e', R: '#7b1fa2',
};

type TipoFinanceiro = 'despesa' | 'receita' | 'transferencia' | 'outros';

function getTipoFinanceiro(top: string | null, estoque: string | null): TipoFinanceiro {
  if (!top) return 'outros';
  const t = top.toUpperCase();
  if (t.includes('VENDA') || t.includes('FAT') || t.includes('PRÉ NOTA') || t.includes('PRE NOTA') || t.includes('FATURA')) return 'receita';
  if (t.includes('COMPRA') || t.includes('PEDIDO') || t.includes('REQUISIÇÃO') || t.includes('REQUISICAO') || t.includes('MARMITEX') || t.includes('COMBUSTIVEL')) return 'despesa';
  if (t.includes('TRANSFERÊNCIA') || t.includes('TRANSFERENCIA') || t.includes('DEVOLUÇÃO') || t.includes('DEVOLUÇAO') || t.includes('RETORNO') || t.includes('COMODATO')) return 'transferencia';
  if (estoque === 'B') return 'despesa';
  if (estoque === 'E') return 'receita';
  return 'outros';
}

const TIPO_FIN_CONFIG: Record<TipoFinanceiro, { label: string; color: string; icon: string }> = {
  despesa: { label: 'Despesa', color: '#d32f2f', icon: '↓' },
  receita: { label: 'Receita', color: '#2e7d32', icon: '↑' },
  transferencia: { label: 'Transf.', color: '#1565c0', icon: '↔' },
  outros: { label: 'Outros', color: '#9e9e9e', icon: '·' },
};

const TOGGLE_SX = {
  height: 28,
  '& .MuiToggleButton-root': { textTransform: 'none' as const, fontSize: 11, fontWeight: 600, px: 1.2, py: 0 },
};

function fmtCurrency(val: number | null): string {
  if (val == null) return '-';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDateTime(val: string | null): string {
  if (!val || typeof val !== 'string') return '-';
  // Formato do SQL: "2026-03-25 134435" (data + HHMMSS colado)
  const parts = val.split(' ');
  if (parts.length < 2) return val;
  const [ano, mes, dia] = parts[0].split('-');
  if (!ano || !mes || !dia) return val;
  const time = parts[1].padStart(6, '0');
  const hh = time.slice(0, 2);
  const mm = time.slice(2, 4);
  return `${dia}/${mes}/${ano.slice(2)} ${hh}:${mm}`;
}

const LOCALE = { ...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhuma movimentacao encontrada' };

export function CabsPorTopPage() {
  const { data, isLoading } = useEmTempoRealMovimentacoes();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const statusFilter = sp.get('status') ?? '';
  const estoqueFilter = sp.get('estoque') ?? '';
  const busca = sp.get('q') ?? '';
  const page = Number(sp.get('page') ?? '0');
  const pageSize = Number(sp.get('size') ?? '10');

  const setParam = useCallback((key: string, val: string) => {
    setSp((prev) => {
      const n = new URLSearchParams(prev);
      if (val) n.set(key, val); else n.delete(key);
      if (key !== 'page') n.delete('page');
      return n;
    }, { replace: true });
  }, [setSp]);

  const allRows = useMemo(() => {
    if (!data) return [];
    return data.map((item, idx) => ({ id: `${item.NUNOTA}-${item.SEQUENCIA}-${idx}`, ...item }));
  }, [data]);

  const rows = useMemo(() => {
    let list = allRows;
    if (statusFilter) list = list.filter((r) => r.STATUS_CODIGO === statusFilter);
    if (estoqueFilter) list = list.filter((r) => r.COD_ATUALIZA_ESTOQUE === estoqueFilter);
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter((r) =>
        String(r.NUNOTA).includes(q) ||
        String(r.NUMERO_NOTA).includes(q) ||
        (r.PARCEIRO_NOME || '').toLowerCase().includes(q) ||
        (r.NOME_USUARIO || '').toLowerCase().includes(q) ||
        (r.DESCRICAO_TIPO_OPER || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [allRows, statusFilter, estoqueFilter, busca]);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'NOME_USUARIO', headerName: 'Usuario', width: 180,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <FuncionarioAvatar codparc={row.CODPARC_USUARIO} nome={row.NOME_USUARIO} size="small" sx={{ width: 28, height: 28 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{row.NOME_USUARIO || '-'}</Typography>
        </Stack>
      ),
    },
    {
      field: 'NUNOTA', headerName: 'Nota', width: 85,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: 'primary.main' }}>
          {value}
        </Typography>
      ),
    },
    {
      field: 'NUMERO_NOTA', headerName: 'Num.', width: 75,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontFamily: 'monospace' }}>{value || '-'}</Typography>,
    },
    {
      field: 'DATA_HORA_MOVIMENTO', headerName: 'Data/Hora', width: 140,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11, fontFamily: 'monospace' }}>{fmtDateTime(value as string)}</Typography>,
    },
    {
      field: 'STATUS_DESCRICAO', headerName: 'Status', width: 115,
      renderCell: ({ row }) => {
        const color = STATUS_COLORS[row.STATUS_CODIGO] || '#9e9e9e';
        return <Chip label={row.STATUS_DESCRICAO} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, bgcolor: alpha(color, 0.1), color }} />;
      },
    },
    {
      field: 'DESCRICAO_TIPO_OPER', headerName: 'Tipo Operacao (TOP)', width: 240,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Chip label={row.CODIGO_TIPO_OPER} size="small" variant="outlined" sx={{ height: 20, fontSize: 10, fontFamily: 'monospace', fontWeight: 700 }} />
          <Typography sx={{ fontSize: 12 }}>{row.DESCRICAO_TIPO_OPER}</Typography>
        </Stack>
      ),
    },
    {
      field: 'DESCRICAO_ATUALIZA_ESTOQUE', headerName: 'Estoque', width: 125,
      renderCell: ({ row }) => {
        const color = EST_COLORS[row.COD_ATUALIZA_ESTOQUE] || '#9e9e9e';
        return <Chip label={row.DESCRICAO_ATUALIZA_ESTOQUE || '-'} size="small" variant="outlined" sx={{ height: 20, fontSize: 10, fontWeight: 600, borderColor: color, color }} />;
      },
    },
    { field: 'PARCEIRO_NOME', headerName: 'Parceiro', flex: 1, minWidth: 180 },
    { field: 'EMPRESA', headerName: 'Emp', width: 50, align: 'center', headerAlign: 'center' },
    {
      field: 'tipoFinanceiro', headerName: 'Tipo', width: 90,
      valueGetter: (_val: unknown, row: any) => getTipoFinanceiro(row.DESCRICAO_TIPO_OPER, row.COD_ATUALIZA_ESTOQUE),
      renderCell: ({ value }) => {
        const cfg = TIPO_FIN_CONFIG[value as TipoFinanceiro] || TIPO_FIN_CONFIG.outros;
        return (
          <Chip label={`${cfg.icon} ${cfg.label}`} size="small" sx={{
            height: 22, fontSize: 10, fontWeight: 700,
            bgcolor: alpha(cfg.color, 0.1), color: cfg.color,
          }} />
        );
      },
    },
    {
      field: 'VALOR_NOTA', headerName: 'Valor', width: 130, align: 'right', headerAlign: 'right',
      renderCell: ({ row }) => {
        const tipo = getTipoFinanceiro(row.DESCRICAO_TIPO_OPER, row.COD_ATUALIZA_ESTOQUE);
        const cfg = TIPO_FIN_CONFIG[tipo];
        const val = row.VALOR_NOTA as number;
        return (
          <Typography sx={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: val > 0 ? cfg.color : 'text.disabled' }}>
            {fmtCurrency(val)}
          </Typography>
        );
      },
    },
  ], []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        density="compact"
        rowHeight={44}
        disableRowSelectionOnClick
        showToolbar
        onRowClick={(params) => navigate(`/cab/${params.row.NUNOTA}`)}
        pageSizeOptions={[10, 25, 50, 100]}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(m) => {
          setSp((prev) => {
            const n = new URLSearchParams(prev);
            if (m.page > 0) n.set('page', String(m.page)); else n.delete('page');
            if (m.pageSize !== 10) n.set('size', String(m.pageSize)); else n.delete('size');
            return n;
          }, { replace: true });
        }}
        initialState={{
          sorting: { sortModel: [{ field: 'DATA_HORA_MOVIMENTO', sort: 'desc' }] },
        }}
        localeText={LOCALE}
        slots={{
          toolbar: () => (
            <Toolbar>
              <Typography fontWeight={700} fontSize={14} sx={{ mr: 1 }}>CABS por TOP</Typography>
              <Chip label={`${rows.length} mov.`} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700 }} />
              {rows.length < allRows.length && (
                <Chip label={`de ${allRows.length}`} size="small" variant="outlined" sx={{ height: 22, fontSize: 10, ml: 0.5 }} />
              )}

              <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 1 }} />

              {/* Filtro status */}
              <ToggleButtonGroup value={statusFilter} exclusive onChange={(_, v) => setParam('status', v ?? '')} size="small" sx={TOGGLE_SX}>
                <ToggleButton value="">Todos</ToggleButton>
                <ToggleButton value="L" sx={{ '&.Mui-selected': { bgcolor: alpha('#2e7d32', 0.12), color: '#2e7d32' } }}>Liberada</ToggleButton>
                <ToggleButton value="P" sx={{ '&.Mui-selected': { bgcolor: alpha('#ed6c02', 0.12), color: '#ed6c02' } }}>Pendente</ToggleButton>
                <ToggleButton value="A" sx={{ '&.Mui-selected': { bgcolor: alpha('#1565c0', 0.12), color: '#1565c0' } }}>Atendimento</ToggleButton>
              </ToggleButtonGroup>

              <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 1 }} />

              {/* Filtro estoque */}
              <ToggleButtonGroup value={estoqueFilter} exclusive onChange={(_, v) => setParam('estoque', v ?? '')} size="small" sx={TOGGLE_SX}>
                <ToggleButton value="">Est.</ToggleButton>
                <ToggleButton value="B" sx={{ '&.Mui-selected': { bgcolor: alpha('#d32f2f', 0.12), color: '#d32f2f' } }}>Baixa</ToggleButton>
                <ToggleButton value="E" sx={{ '&.Mui-selected': { bgcolor: alpha('#2e7d32', 0.12), color: '#2e7d32' } }}>Entrada</ToggleButton>
                <ToggleButton value="N">Sem Mov</ToggleButton>
              </ToggleButtonGroup>

              <Box sx={{ flex: 1 }} />

              {/* Busca */}
              <TextField
                value={busca}
                onChange={(e) => setParam('q', e.target.value)}
                placeholder="Nota, parceiro, usuario, TOP..."
                size="small"
                sx={{ minWidth: 220, '& .MuiInputBase-root': { height: 30, fontSize: 12 } }}
                slotProps={{
                  input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment> },
                }}
              />

              <ColumnsPanelTrigger render={<ToolbarButton />}><ViewColumn fontSize="small" /></ColumnsPanelTrigger>
              <FilterPanelTrigger render={<ToolbarButton />}><FilterList fontSize="small" /></FilterPanelTrigger>
              <ExportCsv render={<ToolbarButton />}><FileDownload fontSize="small" /></ExportCsv>
            </Toolbar>
          ),
        }}
        sx={{
          flex: 1, border: 0,
          '& .MuiDataGrid-columnHeaders': { '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12 } },
          '& .MuiDataGrid-row': { cursor: 'pointer', '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.05) } },
          '& .MuiDataGrid-cell': { fontSize: 12, borderColor: 'divider' },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
        }}
      />
    </Box>
  );
}
