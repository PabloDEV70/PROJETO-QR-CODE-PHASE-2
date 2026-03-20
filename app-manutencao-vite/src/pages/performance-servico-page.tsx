import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Stack, Paper, LinearProgress, alpha, Chip,
  ToggleButtonGroup, ToggleButton, Autocomplete, TextField,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { PersonOff, TouchApp } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { FilterDatePicker } from '@/components/shared/filter-date-picker';
import { EmptyState } from '@/components/shared/empty-state';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import {
  usePerformanceServicoExecutor, usePerformanceServicoExecucoes,
  useServicosComExecucao,
} from '@/hooks/use-manutencao';
import { PerfServicoToolbar } from '@/components/performance-servico/toolbar';
import { ServicoList } from '@/components/performance-servico/servico-list';
import type { PerfServicoExecutor, PerfServicoExecucao } from '@/types/os-types';

const LOCALE = {
  ...ptBR.components.MuiDataGrid.defaultProps.localeText,
  noRowsLabel: 'Nenhum resultado',
  toolbarQuickFilterPlaceholder: 'Buscar...',
  MuiTablePagination: {
    labelRowsPerPage: 'Linhas:',
    labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
      `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`,
  },
};

const TOGGLE_SX = {
  '& .MuiToggleButton-root': {
    textTransform: 'none' as const,
    fontSize: 11, fontWeight: 600,
    px: 1.25, py: 0.25,
    '&.Mui-selected': {
      bgcolor: 'rgba(46,125,50,0.12)',
      color: '#2e7d32',
      '&:hover': { bgcolor: 'rgba(46,125,50,0.18)' },
    },
  },
};

function fmtDate(val: string | null): string {
  if (!val) return '-';
  const d = new Date(val);
  return isNaN(d.getTime()) ? val : d.toLocaleDateString('pt-BR');
}

function fmtDateTime(val: string | null): string {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function fmtMin(min: number): string {
  if (min <= 0) return '-';
  if (min < 60) return `${min.toFixed(0)}min`;
  const h = min / 60;
  return h < 24 ? `${h.toFixed(1)}h` : `${(h / 24).toFixed(1)}d`;
}

export function PerformanceServicoPage() {
  const [sp, setSp] = useSearchParams();

  const codprodStr = sp.get('codprod') ?? '';
  const dataInicio = sp.get('di') ?? '';
  const dataFim = sp.get('df') ?? '';
  const situacaoFilter = sp.get('sit') ?? '';
  const cargoFilter = sp.get('cargo') ?? '';
  const deptoFilter = sp.get('depto') ?? '';
  const viewMode = (sp.get('view') ?? 'exec') as 'exec' | 'grupo';

  const codprod = codprodStr ? Number(codprodStr) : null;

  const setParam = useCallback(
    (key: string, value: string | null) => {
      setSp((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      }, { replace: true });
    },
    [setSp],
  );

  const handleSelect = useCallback(
    (cod: number) => setParam('codprod', String(cod)),
    [setParam],
  );

  const { data: servicosList } = useServicosComExecucao();
  const selectedServico = useMemo(
    () => servicosList?.find((s) => s.codProd === codprod),
    [servicosList, codprod],
  );

  const queryParams = useMemo(() => ({
    codprod,
    ...(dataInicio ? { dataInicio } : {}),
    ...(dataFim ? { dataFim } : {}),
  }), [codprod, dataInicio, dataFim]);

  const { data: grupData, isLoading: grupLoading } = usePerformanceServicoExecutor(queryParams);
  const { data: execData, isLoading: execLoading } = usePerformanceServicoExecucoes(queryParams);

  const isLoading = viewMode === 'exec' ? execLoading : grupLoading;
  const allGrupRows = grupData?.executores ?? [];
  const allExecRows = execData ?? [];
  const resumo = grupData?.resumo;

  // Filter options from grouped data
  const { cargos, deptos } = useMemo(() => {
    const cs = new Set<string>();
    const ds = new Set<string>();
    for (const r of allGrupRows) {
      if (r.cargo) cs.add(r.cargo);
      if (r.departamento) ds.add(r.departamento);
    }
    return {
      cargos: [...cs].sort((a, b) => a.localeCompare(b, 'pt-BR')),
      deptos: [...ds].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    };
  }, [allGrupRows]);

  // Apply filters to grouped view
  const grupRows = useMemo(() => {
    let r = allGrupRows;
    if (situacaoFilter === 'ativo') r = r.filter((x) => x.situacao !== '1');
    if (situacaoFilter === 'desligado') r = r.filter((x) => x.situacao === '1');
    if (cargoFilter) r = r.filter((x) => x.cargo === cargoFilter);
    if (deptoFilter) r = r.filter((x) => x.departamento === deptoFilter);
    return r;
  }, [allGrupRows, situacaoFilter, cargoFilter, deptoFilter]);

  const maxExec = useMemo(
    () => Math.max(1, ...grupRows.map((r) => r.totalExecucoes)),
    [grupRows],
  );

  // --- Grouped columns ---
  const grupColumns: GridColDef<PerfServicoExecutor>[] = useMemo(() => [
    {
      field: 'pos', headerName: '#', width: 40, sortable: false, filterable: false,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: 'text.disabled', fontSize: 11 }}>
          {params.api.getAllRowIds().indexOf(params.id) + 1}
        </Typography>
      ),
    },
    {
      field: 'nomeColaborador', headerName: 'Colaborador', flex: 1, minWidth: 260,
      renderCell: ({ row }) => {
        const desligado = row.situacao === '1';
        return (
          <Tooltip title={`Usuario: ${row.nomeUsuario} (cod ${row.codusu})`} placement="right" arrow>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, opacity: desligado ? 0.5 : 1 }}>
              <FuncionarioAvatar
                codparc={row.codparc ?? 0} codemp={row.codemp ?? undefined}
                codfunc={row.codfunc ?? undefined} nome={row.nomeColaborador}
                size="small" sx={{ width: 36, height: 36, flexShrink: 0 }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography fontSize={12.5} fontWeight={600} noWrap
                    sx={{ textDecoration: desligado ? 'line-through' : undefined }}>
                    {row.nomeColaborador}
                  </Typography>
                  {desligado && <PersonOff sx={{ fontSize: 13, color: 'error.main' }} />}
                </Stack>
                <Typography color="text.disabled" fontSize={10} noWrap>
                  {[row.cargo, row.departamento].filter(Boolean).join(' · ')}
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: 'totalExecucoes', headerName: 'Execucoes', width: 140,
      renderCell: ({ value }) => {
        const pct = maxExec > 0 ? (value / maxExec) * 100 : 0;
        return (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, minWidth: 24, textAlign: 'right' }}>{value}</Typography>
            <LinearProgress variant="determinate" value={pct} sx={{
              flex: 1, height: 6, borderRadius: 1,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                bgcolor: pct > 66 ? 'primary.main' : pct > 33 ? 'warning.main' : 'text.disabled',
              },
            }} />
          </Box>
        );
      },
    },
    { field: 'mediaMinutos', headerName: 'Media', width: 75, align: 'right', headerAlign: 'right',
      renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{fmtMin(value)}</Typography> },
    { field: 'minMinutos', headerName: 'Min', width: 65, align: 'right', headerAlign: 'right',
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11, color: 'success.main' }}>{fmtMin(value)}</Typography> },
    { field: 'maxMinutos', headerName: 'Max', width: 65, align: 'right', headerAlign: 'right',
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11, color: 'error.main' }}>{fmtMin(value)}</Typography> },
    { field: 'totalMinutos', headerName: 'Total', width: 75, align: 'right', headerAlign: 'right',
      renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{value > 0 ? `${(value / 60).toFixed(1)}h` : '-'}</Typography> },
    { field: 'primeiraExec', headerName: 'Primeira', width: 88, align: 'center', headerAlign: 'center',
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11 }}>{fmtDate(value)}</Typography> },
    { field: 'ultimaExec', headerName: 'Ultima', width: 88, align: 'center', headerAlign: 'center',
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11 }}>{fmtDate(value)}</Typography> },
  ], [maxExec]);

  // --- Execution detail columns ---
  const execColumns: GridColDef<PerfServicoExecucao>[] = useMemo(() => [
    { field: 'nuos', headerName: 'OS', width: 70, align: 'right', headerAlign: 'right',
      renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{value}</Typography> },
    {
      field: 'nomeColaborador', headerName: 'Executor', flex: 1, minWidth: 200,
      renderCell: ({ row }) => (
        <Tooltip title={row.nomeUsuario ? `Usuario: ${row.nomeUsuario} (${row.codusu})` : ''} placement="right" arrow>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
            <FuncionarioAvatar
              codparc={row.codparc ?? 0} nome={row.nomeColaborador ?? '?'}
              size="small" sx={{ width: 28, height: 28, flexShrink: 0 }}
            />
            <Typography fontSize={12} fontWeight={500} noWrap>
              {row.nomeColaborador ?? row.nomeUsuario ?? '-'}
            </Typography>
          </Box>
        </Tooltip>
      ),
    },
    {
      field: 'placa', headerName: 'Veiculo', width: 140,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography fontSize={12} fontWeight={600} noWrap>{row.placa ?? '-'}</Typography>
          {row.marcaModelo && (
            <Typography fontSize={9} color="text.disabled" noWrap>{row.marcaModelo}</Typography>
          )}
        </Box>
      ),
    },
    { field: 'dtIni', headerName: 'Inicio', width: 120,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11 }}>{fmtDateTime(value)}</Typography> },
    { field: 'dtFin', headerName: 'Fim', width: 120,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11 }}>{fmtDateTime(value)}</Typography> },
    { field: 'minutos', headerName: 'Duracao', width: 80, align: 'right', headerAlign: 'right',
      renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{fmtMin(value)}</Typography> },
    { field: 'statusOsLabel', headerName: 'Status OS', width: 100,
      renderCell: ({ row }) => {
        const color = row.statusOs === 'F' ? 'success' : row.statusOs === 'E' ? 'info' : row.statusOs === 'C' ? 'error' : 'default';
        return <Chip label={row.statusOsLabel ?? '-'} size="small" color={color} variant="outlined" sx={{ fontSize: 10, height: 22 }} />;
      },
    },
    { field: 'observacao', headerName: 'Obs', flex: 1, minWidth: 150,
      renderCell: ({ value }) => (
        <Tooltip title={value ?? ''} placement="left">
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }} noWrap>{value || '-'}</Typography>
        </Tooltip>
      ),
    },
  ], []);

  const toolbarProps = useMemo(() => ({
    servicoNome: selectedServico?.descrProd,
    servicoCod: codprod,
    servicoGrupo: selectedServico?.descrGrupo,
    resumoExecutores: resumo?.totalExecutores,
    resumoExecucoes: resumo?.totalExecucoes,
    resumoMediaMin: resumo?.mediaMinutos,
    resumoTotalMin: resumo?.totalMinutos,
  }), [selectedServico, codprod, resumo]);

  const hasFilters = situacaoFilter || cargoFilter || deptoFilter;

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Paper
        elevation={0}
        sx={{
          width: 340, flexShrink: 0, borderRight: 1, borderColor: 'divider',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <ServicoList codprod={codprod} onSelect={handleSelect} />
      </Paper>

      {/* Content */}
      {!codprod ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState
            icon={<TouchApp sx={{ fontSize: 28, color: 'text.disabled' }} />}
            title="Selecione um servico"
            subtitle="Escolha um servico na lista ao lado para ver as execucoes"
          />
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Filter bar */}
          <Stack
            direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap
            sx={{ px: 1.5, py: 0.75, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
          >
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => { if (v) setParam('view', v === 'exec' ? null : v); }}
              size="small"
              sx={TOGGLE_SX}
            >
              <ToggleButton value="exec">Execucoes</ToggleButton>
              <ToggleButton value="grupo">Por executor</ToggleButton>
            </ToggleButtonGroup>

            <FilterDatePicker value={dataInicio || null} onChange={(v) => setParam('di', v)} placeholder="Data inicio" width={135} />
            <FilterDatePicker value={dataFim || null} onChange={(v) => setParam('df', v)} placeholder="Data fim" width={135} />

            {viewMode === 'grupo' && (
              <>
                <ToggleButtonGroup
                  value={situacaoFilter} exclusive
                  onChange={(_, v) => setParam('sit', v || null)}
                  size="small" sx={TOGGLE_SX}
                >
                  <ToggleButton value="">Todos</ToggleButton>
                  <ToggleButton value="ativo">Ativos</ToggleButton>
                  <ToggleButton value="desligado">Desl.</ToggleButton>
                </ToggleButtonGroup>

                {cargos.length > 1 && (
                  <Autocomplete size="small" sx={{ width: 170 }} options={cargos}
                    value={cargoFilter || null} onChange={(_, v) => setParam('cargo', v)}
                    renderInput={(p) => <TextField {...p} placeholder="Funcao" />} clearOnEscape />
                )}
                {deptos.length > 1 && (
                  <Autocomplete size="small" sx={{ width: 180 }} options={deptos}
                    value={deptoFilter || null} onChange={(_, v) => setParam('depto', v)}
                    renderInput={(p) => <TextField {...p} placeholder="Departamento" />} clearOnEscape />
                )}

                {hasFilters && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10 }}>
                    {grupRows.length}/{allGrupRows.length}
                  </Typography>
                )}
              </>
            )}
          </Stack>

          {/* DataGrid */}
          {viewMode === 'exec' ? (
            <DataGrid
              rows={allExecRows}
              columns={execColumns}
              getRowId={(row) => `${row.nuos}-${row.sequencia}-${row.codusu ?? 0}`}
              loading={isLoading}
              rowHeight={48}
              disableRowSelectionOnClick
              showToolbar
              slots={{ toolbar: PerfServicoToolbar }}
              slotProps={{ toolbar: toolbarProps }}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 50 } },
              }}
              localeText={LOCALE}
              sx={gridSx}
            />
          ) : (
            <DataGrid
              rows={grupRows}
              columns={grupColumns}
              getRowId={(row) => `${row.codusu}-${row.situacao ?? 'x'}`}
              loading={isLoading}
              rowHeight={52}
              disableRowSelectionOnClick
              showToolbar
              slots={{ toolbar: PerfServicoToolbar }}
              slotProps={{ toolbar: toolbarProps }}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 50 } },
                sorting: { sortModel: [{ field: 'totalExecucoes', sort: 'desc' }] },
              }}
              localeText={LOCALE}
              sx={gridSx}
            />
          )}
        </Box>
      )}
    </Box>
  );
}

const gridSx = {
  flex: 1, border: 0,
  '& .MuiDataGrid-columnHeaders': {
    bgcolor: 'rgba(46,125,50,0.04)',
    '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12.5 },
  },
  '& .MuiDataGrid-row': {
    transition: 'background-color 0.15s',
    '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.012)' },
    '&:hover': { bgcolor: (t: { palette: { primary: { main: string } } }) => alpha(t.palette.primary.main, 0.05) },
  },
  '& .MuiDataGrid-cell': { fontSize: 13, borderColor: 'divider' },
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
    outline: 'none',
  },
  '& .MuiDataGrid-footerContainer': { borderTop: 1, borderColor: 'divider', minHeight: 44 },
  '& .MuiDataGrid-scrollbarFiller': { display: 'none' },
} as const;
