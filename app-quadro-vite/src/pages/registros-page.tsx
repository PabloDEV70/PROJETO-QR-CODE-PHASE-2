import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, TextField, InputAdornment,
  alpha, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
  Search, ViewColumn, FilterList, FileDownload,
} from '@mui/icons-material';
import {
  DataGrid, type GridColDef,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { useHstVeiList } from '@/hooks/use-hstvei';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import type { ListHstVeiParams } from '@/api/hstvei';
import type { HstVeiEnriched } from '@/types/hstvei-types';

const PRI_COLORS: Record<string, string> = { U: '#f44336', A: '#ff9800', M: '#ffc107', B: '#4caf50' };

function fmtDt(val: unknown): string {
  if (!val) return '-';
  const d = new Date(val as string);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function fmtDuracao(min: number | null): string {
  if (min == null) return '-';
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const LOCALE = { ...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhum registro encontrado' };

const TOGGLE_SX = {
  height: 28,
  '& .MuiToggleButton-root': { textTransform: 'none' as const, fontSize: 11, fontWeight: 600, px: 1.2, py: 0 },
};

export function RegistrosPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [ativas, setAtivas] = useState<'true' | 'false' | ''>('');
  const [busca, setBusca] = useState('');

  const params: ListHstVeiParams = useMemo(() => ({
    page: page + 1,
    limit: pageSize,
    ...(ativas ? { ativas } : {}),
    ...(busca ? { busca } : {}),
    orderBy: 'DTINICIO',
    orderDir: 'DESC' as const,
  }), [page, pageSize, ativas, busca]);

  const { data, isLoading } = useHstVeiList(params);
  const rows = data?.data ?? [];
  const totalRows = data?.meta?.totalRegistros ?? 0;

  const columns: GridColDef<HstVeiEnriched>[] = useMemo(() => [
    { field: 'ID', headerName: '#', width: 60, renderCell: ({ value }) => <Typography sx={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600 }}>{value}</Typography> },
    { field: 'placa', headerName: 'Placa', width: 100, renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>{value ?? '-'}</Typography> },
    { field: 'veiculoTag', headerName: 'Tag', width: 90, renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>{value ?? ''}</Typography> },
    {
      field: 'situacaoDescricao', headerName: 'Situacao', width: 160,
      renderCell: ({ row }) => {
        const dep = getDepartamentoInfo(row.departamentoNome);
        return <Chip label={row.situacaoDescricao} size="small" sx={{ fontSize: 10, fontWeight: 700, height: 22, bgcolor: dep.bgLight, color: dep.color }} />;
      },
    },
    {
      field: 'departamentoNome', headerName: 'Departamento', width: 140,
      renderCell: ({ value }) => {
        const dep = getDepartamentoInfo(value as string);
        const Icon = dep.Icon;
        return <Chip icon={<Icon sx={{ fontSize: '14px !important' }} />} label={dep.label} size="small" sx={{ fontSize: 10, height: 22, bgcolor: dep.bgLight, color: dep.color }} />;
      },
    },
    {
      field: 'IDPRI', headerName: 'Prior.', width: 60, align: 'center', headerAlign: 'center',
      renderCell: ({ row }) => {
        const sigla = row.prioridadeSigla;
        const color = PRI_COLORS[sigla as string] ?? '#9e9e9e';
        return <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />;
      },
    },
    { field: 'nomeParc', headerName: 'Cliente', flex: 1, minWidth: 150 },
    { field: 'DESCRICAO', headerName: 'Descricao', flex: 1, minWidth: 150 },
    {
      field: 'DTINICIO', headerName: 'Inicio', width: 120,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11, fontFamily: 'monospace' }}>{fmtDt(value)}</Typography>,
    },
    {
      field: 'DTFIM', headerName: 'Encerrado', width: 120,
      renderCell: ({ value }) => value
        ? <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: 'success.main' }}>{fmtDt(value)}</Typography>
        : <Chip label="ATIVO" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 800, bgcolor: alpha('#2e7d32', 0.12), color: '#2e7d32' }} />,
    },
    {
      field: 'duracaoMinutos', headerName: 'Duracao', width: 80, align: 'center',
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11, fontFamily: 'monospace' }}>{fmtDuracao(value as number)}</Typography>,
    },
    { field: 'nomeUsuInc', headerName: 'Criado por', width: 120 },
  ], []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.ID}
        loading={isLoading}
        density="compact"
        rowHeight={44}
        disableRowSelectionOnClick
        showToolbar
        paginationMode="server"
        rowCount={totalRows}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
        pageSizeOptions={[25, 50, 100, 200]}
        onRowClick={(params) => navigate(`/situacao/${params.row.ID}`)}
        localeText={LOCALE}
        slots={{
          toolbar: () => (
            <Toolbar>
              <Typography fontWeight={700} fontSize={14} sx={{ mr: 1 }}>Registros</Typography>
              <Chip label={`${totalRows} total`} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, mr: 1 }} />

              <ToggleButtonGroup value={ativas} exclusive onChange={(_, v) => { setAtivas(v ?? ''); setPage(0); }} size="small" sx={TOGGLE_SX}>
                <ToggleButton value="">Todos</ToggleButton>
                <ToggleButton value="true">Ativos</ToggleButton>
                <ToggleButton value="false">Encerrados</ToggleButton>
              </ToggleButtonGroup>

              <Box sx={{ flex: 1 }} />

              <TextField
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPage(0); }}
                placeholder="Buscar placa, tag, cliente..."
                size="small"
                sx={{ minWidth: 200, '& .MuiInputBase-root': { height: 30, fontSize: 12 } }}
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
