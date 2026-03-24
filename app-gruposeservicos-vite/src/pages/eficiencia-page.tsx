import { useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box, Typography, Stack, CircularProgress, TextField, InputAdornment,
  List, ListItemButton, Chip, Collapse, Divider, alpha,
  Tooltip, ToggleButtonGroup, ToggleButton, Autocomplete,
  Badge, Menu, MenuItem, ListItemText, LinearProgress,
  IconButton, Popover,
} from '@mui/material';
import {
  Search, ExpandMore, ExpandLess, FolderOpen, Folder,
  People, PlayArrow, TouchApp, PersonOff, ViewColumn,
  FilterList, FileDownload, TuneRounded, BarChart,
  CalendarMonth, DirectionsCar,
} from '@mui/icons-material';
import {
  DataGrid, type GridColDef, type GridRowSelectionModel,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv, ExportPrint,
  QuickFilter, QuickFilterControl, QuickFilterTrigger,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { QuartilDialog } from '@/components/eficiencia/quartil-dialog';
import {
  useServicosComExecucao,
  usePerformanceExecucoes,
  usePerformanceExecutor,
} from '@/hooks/use-eficiencia';
import type { ServicoComExecucao, PerfExecutor, EficienciaParams } from '@/types/eficiencia-types';

// ── Formatters ──

function fmtMin(min: number): string {
  if (min <= 0) return '-';
  if (min < 60) return `${min.toFixed(0)}min`;
  const h = min / 60;
  return h < 24 ? `${h.toFixed(1)}h` : `${(h / 24).toFixed(1)}d`;
}

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

// ═══════════════════════════════════════════════════════════
// SIDEBAR (same as before — unchanged)
// ═══════════════════════════════════════════════════════════

interface GrupoNode {
  codGrupo: number; descr: string; descrPai: string | null;
  servicos: ServicoComExecucao[]; totalExec: number; totalExecutores: number;
}

function buildGrupos(items: ServicoComExecucao[]): GrupoNode[] {
  const map = new Map<number, GrupoNode>();
  for (const s of items) {
    let node = map.get(s.codGrupo);
    if (!node) { node = { codGrupo: s.codGrupo, descr: s.descrGrupo ?? 'Sem grupo', descrPai: s.descrGrupoPai, servicos: [], totalExec: 0, totalExecutores: 0 }; map.set(s.codGrupo, node); }
    node.servicos.push(s); node.totalExec += s.totalExecucoes; node.totalExecutores += s.totalExecutores;
  }
  const arr = [...map.values()]; arr.sort((a, b) => b.totalExec - a.totalExec);
  for (const g of arr) g.servicos.sort((a, b) => b.totalExecucoes - a.totalExecucoes);
  return arr;
}

function GrupoSection({ grupo, codprod, onSelect, maxExec, defaultOpen }: { grupo: GrupoNode; codprod: number | null; onSelect: (cod: number) => void; maxExec: number; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const hasSelected = grupo.servicos.some((s) => s.codProd === codprod);
  return (
    <>
      <ListItemButton onClick={() => setOpen(!open)} sx={{ py: 0.75, px: 1.5, bgcolor: (t) => hasSelected ? alpha(t.palette.primary.main, 0.06) : alpha(t.palette.text.primary, 0.02), borderBottom: 1, borderColor: 'divider', '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.06) } }}>
        {open ? <FolderOpen sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} /> : <Folder sx={{ fontSize: 18, mr: 1, color: 'text.disabled' }} />}
        <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, lineHeight: 1.3 }} noWrap>{grupo.descr}</Typography>
          {grupo.descrPai && <Typography sx={{ fontSize: 9, color: 'text.disabled', lineHeight: 1.2 }} noWrap>{grupo.descrPai}</Typography>}
          <Stack direction="row" spacing={1} sx={{ mt: 0.25 }}>
            <Typography sx={{ fontSize: 9, color: 'text.disabled' }}>{grupo.servicos.length} servico{grupo.servicos.length !== 1 ? 's' : ''}</Typography>
            <Typography sx={{ fontSize: 9, color: 'text.disabled' }}>{grupo.totalExec} exec.</Typography>
          </Stack>
        </Box>
        {open ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding>
          {grupo.servicos.map((s) => { const selected = codprod === s.codProd; const pct = maxExec > 0 ? (s.totalExecucoes / maxExec) * 100 : 0; return (
            <ListItemButton key={s.codProd} selected={selected} onClick={() => onSelect(s.codProd)} sx={{ py: 0.75, pl: 3, pr: 1.5, borderLeft: 3, borderLeftColor: selected ? 'primary.main' : 'transparent', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, bgcolor: (t) => alpha(t.palette.primary.main, selected ? 0.1 : 0.04), transition: 'width 0.3s', zIndex: 0 }, '&.Mui-selected': { bgcolor: 'transparent', '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.08) } } }}>
              <Box sx={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1, mr: 1 }}>
                <Typography sx={{ fontSize: 11.5, fontWeight: selected ? 700 : 400, color: selected ? 'primary.main' : 'text.primary' }} noWrap>{s.descrProd}</Typography>
                <Typography sx={{ fontSize: 9, color: 'text.disabled', fontFamily: 'monospace' }}>#{s.codProd}</Typography>
              </Box>
              <Stack alignItems="flex-end" spacing={0} sx={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}><People sx={{ fontSize: 11, color: selected ? 'primary.main' : 'text.disabled' }} /><Typography sx={{ fontSize: 12, fontWeight: 700, color: selected ? 'primary.main' : 'text.secondary' }}>{s.totalExecutores}</Typography></Stack>
                <Stack direction="row" alignItems="center" spacing={0.25}><PlayArrow sx={{ fontSize: 9, color: 'text.disabled' }} /><Typography sx={{ fontSize: 9, color: 'text.disabled' }}>{s.totalExecucoes} exec</Typography><Typography sx={{ fontSize: 9, color: 'text.disabled', ml: 0.5 }}>{fmtMin(s.mediaMinutos)}</Typography></Stack>
              </Stack>
            </ListItemButton>
          ); })}
        </List>
      </Collapse>
    </>
  );
}

function ServicoList({ codprod, onSelect }: { codprod: number | null; onSelect: (cod: number) => void }) {
  const { data: servicos, isLoading } = useServicosComExecucao();
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => { if (!servicos) return []; if (!search) return servicos; const q = search.toLowerCase(); return servicos.filter((s) => s.descrProd.toLowerCase().includes(q) || s.descrGrupo?.toLowerCase().includes(q) || s.descrGrupoPai?.toLowerCase().includes(q) || String(s.codProd).includes(q)); }, [servicos, search]);
  const grupos = useMemo(() => buildGrupos(filtered), [filtered]);
  const maxExec = useMemo(() => Math.max(1, ...filtered.map((s) => s.totalExecucoes)), [filtered]);
  const total = servicos?.length ?? 0;
  const totalExec = useMemo(() => filtered.reduce((s, r) => s + r.totalExecucoes, 0), [filtered]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 1.5, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: 13, mb: 0.5 }}>Servicos executados</Typography>
        <TextField size="small" fullWidth placeholder="Buscar servico, grupo ou codigo..." value={search} onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment>, sx: { fontSize: 12 } } }} />
        {search && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</Typography>}
      </Box>
      {total > 0 && (
        <Box sx={{ px: 1.5, py: 0.75, borderBottom: 1, borderColor: 'divider', bgcolor: (t) => alpha(t.palette.primary.main, 0.03) }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip label={`${total} servicos`} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 600 }} />
            <Chip label={`${grupos.length} grupos`} size="small" variant="outlined" sx={{ height: 20, fontSize: 10, fontWeight: 600 }} />
            <Chip icon={<PlayArrow sx={{ fontSize: '12px !important' }} />} label={`${totalExec.toLocaleString('pt-BR')} exec.`} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: 10, fontWeight: 600 }} />
          </Stack>
        </Box>
      )}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={24} /></Stack>
          : grupos.length === 0 ? <Stack alignItems="center" sx={{ py: 6, px: 2 }}><Search sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} /><Typography variant="body2" color="text.secondary" textAlign="center">{search ? 'Nenhum servico encontrado' : 'Nenhum servico com execucoes'}</Typography></Stack>
          : <List disablePadding>{grupos.map((g, i) => <GrupoSection key={g.codGrupo} grupo={g} codprod={codprod} onSelect={onSelect} maxExec={maxExec} defaultOpen={i === 0 || g.servicos.some((s) => s.codProd === codprod)} />)}</List>}
      </Box>
      <Divider />
      <Box sx={{ px: 1.5, py: 0.5, bgcolor: (t) => alpha(t.palette.text.primary, 0.02) }}>
        <Typography sx={{ fontSize: 9, color: 'text.disabled', textAlign: 'center' }}>Somente servicos com execucoes registradas (AD_TCFEXEC)</Typography>
      </Box>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════
// TOOLBAR — limpa, filtros em popovers
// ═══════════════════════════════════════════════════════════

type OwnerState = { expanded: boolean };
const StyledQuickFilter = styled(QuickFilter)({ display: 'grid', alignItems: 'center' });
const StyledSearchTrigger = styled(ToolbarButton)<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({ gridArea: '1 / 1', width: 'min-content', height: 'min-content', zIndex: 1, opacity: ownerState.expanded ? 0 : 1, pointerEvents: ownerState.expanded ? 'none' : 'auto', transition: theme.transitions.create(['opacity']) }));
const StyledSearchField = styled(TextField)<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({ gridArea: '1 / 1', overflowX: 'clip', width: ownerState.expanded ? 200 : 'var(--trigger-width)', opacity: ownerState.expanded ? 1 : 0, transition: theme.transitions.create(['width', 'opacity']) }));

const TOGGLE_SX = { height: 28, '& .MuiToggleButton-root': { textTransform: 'none' as const, fontSize: 11, fontWeight: 600, px: 1.25, py: 0, '&.Mui-selected': { bgcolor: 'rgba(46,125,50,0.12)', color: '#2e7d32', '&:hover': { bgcolor: 'rgba(46,125,50,0.18)' } } } };

interface EfToolbarProps {
  [key: string]: any;
  servicoNome?: string; servicoCod?: number | null; servicoGrupo?: string | null;
  resumoExecutores?: number; resumoExecucoes?: number; resumoMediaMin?: number; resumoTotalMin?: number;
  viewMode: 'exec' | 'grupo'; onViewChange: (v: 'exec' | 'grupo') => void;
  placas: string[]; placaFilter: string; onPlacaChange: (v: string | null) => void;
  dataInicio: string; dataFim: string; onDataInicioChange: (v: string | null) => void; onDataFimChange: (v: string | null) => void;
  hasActiveFilters: boolean; onOpenQuartil: () => void;
  selectedCount: number;
}
declare module '@mui/x-data-grid' { interface ToolbarPropsOverrides extends EfToolbarProps {} }

function EficienciaToolbar(props: EfToolbarProps) {
  const {
    servicoNome, servicoCod, servicoGrupo,
    resumoExecutores, resumoExecucoes, resumoMediaMin, resumoTotalMin: _resumoTotalMin,
    viewMode, onViewChange, placas, placaFilter, onPlacaChange,
    dataInicio, dataFim, onDataInicioChange, onDataFimChange,
    hasActiveFilters, onOpenQuartil, selectedCount,
  } = props;
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLButtonElement>(null);
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);

  return (
    <Toolbar>
      {/* ── Titulo ── */}
      {servicoNome ? (
        <Typography fontWeight={700} fontSize={13} noWrap sx={{ mr: 0.5, maxWidth: 260 }}>{servicoNome}</Typography>
      ) : (
        <Typography fontWeight="medium" color="text.disabled" sx={{ mx: 0.5 }}>Selecione um servico</Typography>
      )}
      {servicoCod && <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: 'text.disabled', mr: 0.5 }}>#{servicoCod}</Typography>}
      {servicoGrupo && <Chip label={servicoGrupo} size="small" sx={{ fontSize: 9, height: 18, mr: 0.5 }} />}

      {/* ── KPIs ── */}
      {resumoExecucoes != null && resumoExecucoes > 0 && (
        <>
          <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10.5, whiteSpace: 'nowrap' }}>
            <b>{resumoExecutores}</b> exec. &middot; <b>{resumoExecucoes}</b> total
            &middot; <b>{fmtMin(resumoMediaMin ?? 0)}</b>
          </Typography>
        </>
      )}

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      {/* ── View toggle ── */}
      <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => { if (v) onViewChange(v); }} size="small" sx={TOGGLE_SX}>
        <ToggleButton value="exec">Execucoes</ToggleButton>
        <ToggleButton value="grupo">Por executor</ToggleButton>
      </ToggleButtonGroup>

      {/* ── Filtros (popover) ── */}
      <Tooltip title="Filtros de periodo e veiculo">
        <IconButton size="small" onClick={(e) => setFilterAnchor(e.currentTarget)} sx={{ ml: 0.5 }}>
          <Badge variant="dot" color="warning" invisible={!hasActiveFilters}>
            <TuneRounded sx={{ fontSize: 18 }} />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover open={Boolean(filterAnchor)} anchorEl={filterAnchor} onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 2, minWidth: 320 } } }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1.5 }}>Filtros</Typography>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
            <TextField type="date" size="small" label="Inicio" value={dataInicio}
              onChange={(e) => onDataInicioChange(e.target.value || null)}
              slotProps={{ inputLabel: { shrink: true } }} sx={{ flex: 1 }} />
            <TextField type="date" size="small" label="Fim" value={dataFim}
              onChange={(e) => onDataFimChange(e.target.value || null)}
              slotProps={{ inputLabel: { shrink: true } }} sx={{ flex: 1 }} />
          </Stack>
          {placas.length > 1 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <DirectionsCar sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Autocomplete size="small" sx={{ flex: 1 }} options={placas}
                value={placaFilter || null} onChange={(_, v) => onPlacaChange(v)}
                renderInput={(p) => <TextField {...p} label="Veiculo (placa)" />} clearOnEscape />
            </Stack>
          )}
          <Typography sx={{ fontSize: 9, color: 'text.disabled' }}>Periodo filtra pela data de inicio da execucao (ex.DTINI)</Typography>
        </Stack>
      </Popover>

      {/* ── Quartil dialog button ── */}
      {servicoCod && (
        <Tooltip title={selectedCount > 0 ? `Analise quartil (${selectedCount} excluidas)` : 'Analise quartil'}>
          <IconButton size="small" onClick={onOpenQuartil} color={selectedCount > 0 ? 'warning' : 'default'} sx={{ ml: 0.5 }}>
            <Badge badgeContent={selectedCount > 0 ? selectedCount : undefined} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 16, minWidth: 16 } }}>
              <BarChart sx={{ fontSize: 18 }} />
            </Badge>
          </IconButton>
        </Tooltip>
      )}

      <div style={{ flex: 1 }} />

      {/* ── Standard actions ── */}
      <Tooltip title="Colunas"><ColumnsPanelTrigger render={<ToolbarButton />}><ViewColumn fontSize="small" /></ColumnsPanelTrigger></Tooltip>
      <Tooltip title="Filtros avancados">
        <FilterPanelTrigger render={(fp, state) => (
          <ToolbarButton {...fp} color="default"><Badge badgeContent={state.filterCount} color="primary" variant="dot"><FilterList fontSize="small" /></Badge></ToolbarButton>
        )} />
      </Tooltip>
      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
      <Tooltip title="Exportar"><ToolbarButton ref={exportRef} onClick={() => setExportOpen(true)}><FileDownload fontSize="small" /></ToolbarButton></Tooltip>
      <Menu anchorEl={exportRef.current} open={exportOpen} onClose={() => setExportOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <ExportPrint render={<MenuItem />} onClick={() => setExportOpen(false)}><ListItemText>Imprimir</ListItemText></ExportPrint>
        <ExportCsv render={<MenuItem />} onClick={() => setExportOpen(false)}><ListItemText>Baixar CSV</ListItemText></ExportCsv>
      </Menu>
      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
      <StyledQuickFilter>
        <QuickFilterTrigger render={(triggerProps, state) => (
          <Tooltip title="Buscar" enterDelay={0}><StyledSearchTrigger {...triggerProps} ownerState={{ expanded: state.expanded }} color="default" aria-disabled={state.expanded}><Search fontSize="small" /></StyledSearchTrigger></Tooltip>
        )} />
        <QuickFilterControl render={({ ref, ...controlProps }, state) => (
          <StyledSearchField {...controlProps} ownerState={{ expanded: state.expanded }} inputRef={ref} placeholder="Buscar..." size="small"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }} />
        )} />
      </StyledQuickFilter>
    </Toolbar>
  );
}

// ═══════════════════════════════════════════════════════════
// GRID STYLES + LOCALE
// ═══════════════════════════════════════════════════════════

const LOCALE = { ...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhum resultado', MuiTablePagination: { labelRowsPerPage: 'Linhas:', labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}` } };
const gridSx = { flex: 1, border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(46,125,50,0.04)', '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12.5 } }, '& .MuiDataGrid-row': { transition: 'background-color 0.15s', '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.012)' }, '&:hover': { bgcolor: (t: { palette: { primary: { main: string } } }) => alpha(t.palette.primary.main, 0.05) } }, '& .MuiDataGrid-cell': { fontSize: 13, borderColor: 'divider' }, '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' }, '& .MuiDataGrid-footerContainer': { borderTop: 1, borderColor: 'divider', minHeight: 44 }, '& .MuiDataGrid-scrollbarFiller': { display: 'none' } } as const;

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════

export function EficienciaPage() {
  const [sp, setSp] = useSearchParams();
  const codprodStr = sp.get('servico') ?? '';
  const viewMode = (sp.get('view') ?? 'exec') as 'exec' | 'grupo';
  const placaFilter = sp.get('placa') ?? '';
  const dataInicio = sp.get('di') ?? '';
  const dataFim = sp.get('df') ?? '';
  const codprod = codprodStr ? Number(codprodStr) : null;

  const setParam = useCallback((key: string, value: string | null) => {
    setSp((prev) => { const next = new URLSearchParams(prev); if (value) next.set(key, value); else next.delete(key); return next; }, { replace: true });
  }, [setSp]);

  const handleSelect = useCallback((cod: number) => setParam('servico', String(cod)), [setParam]);

  // Data
  const { data: servicosList } = useServicosComExecucao();
  const selectedServico = useMemo(() => servicosList?.find((s) => s.codProd === codprod), [servicosList, codprod]);
  const params: EficienciaParams | null = useMemo(() => codprod ? { codprod } : null, [codprod]);
  const { data: grupData, isLoading: grupLoading } = usePerformanceExecutor(params);
  const { data: execData, isLoading: execLoading } = usePerformanceExecucoes(params);

  const isLoading = viewMode === 'exec' ? execLoading : grupLoading;
  const allGrupRows = grupData?.executores ?? [];
  const allExecRows = execData ?? [];
  const resumo = grupData?.resumo;

  // Filters
  const placas = useMemo(() => { const set = new Set<string>(); for (const e of allExecRows) if (e.placa) set.add(e.placa.trim()); return [...set].sort(); }, [allExecRows]);
  const filteredExecRows = useMemo(() => {
    let rows = allExecRows;
    if (placaFilter) rows = rows.filter((e) => e.placa?.trim() === placaFilter);
    if (dataInicio) rows = rows.filter((e) => e.dtIni && e.dtIni >= dataInicio);
    if (dataFim) rows = rows.filter((e) => e.dtIni && e.dtIni <= dataFim + 'T23:59:59');
    return rows;
  }, [allExecRows, placaFilter, dataInicio, dataFim]);
  const hasActiveFilters = Boolean(placaFilter || dataInicio || dataFim);

  const maxExec = useMemo(() => Math.max(1, ...allGrupRows.map((r) => r.totalExecucoes)), [allGrupRows]);

  // Selection (for excluding outliers)
  const [execSelection, setExecSelection] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });
  const [grupSelection, setGrupSelection] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });
  const excludedIds = useMemo(() => {
    const sel = viewMode === 'exec' ? execSelection : grupSelection;
    return sel.type === 'include' ? new Set(Array.from(sel.ids).map(String)) : new Set<string>();
  }, [viewMode, execSelection, grupSelection]);

  // Quartil dialog
  const [quartilOpen, setQuartilOpen] = useState(false);

  const toolbarProps: EfToolbarProps = useMemo(() => ({
    servicoNome: selectedServico?.descrProd, servicoCod: codprod, servicoGrupo: selectedServico?.descrGrupo,
    resumoExecutores: resumo?.totalExecutores, resumoExecucoes: resumo?.totalExecucoes, resumoMediaMin: resumo?.mediaMinutos, resumoTotalMin: resumo?.totalMinutos,
    viewMode, onViewChange: (v: 'exec' | 'grupo') => setParam('view', v === 'exec' ? null : v),
    placas, placaFilter, onPlacaChange: (v: string | null) => setParam('placa', v),
    dataInicio, dataFim, onDataInicioChange: (v: string | null) => setParam('di', v), onDataFimChange: (v: string | null) => setParam('df', v),
    hasActiveFilters, onOpenQuartil: () => setQuartilOpen(true), selectedCount: excludedIds.size,
  }), [selectedServico, codprod, resumo, viewMode, placas, placaFilter, dataInicio, dataFim, hasActiveFilters, excludedIds.size, setParam]);

  // ── Exec columns ──
  const execColumns: GridColDef[] = useMemo(() => [
    { field: 'nuos', headerName: 'OS', width: 70, align: 'right', headerAlign: 'right', renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{value}</Typography> },
    { field: 'nomeColaborador', headerName: 'Executor', flex: 1, minWidth: 200, renderCell: ({ row }) => (
      <Tooltip title={row.nomeUsuario ? `Usuario: ${row.nomeUsuario} (${row.codusu})` : ''} placement="right" arrow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
          <FuncionarioAvatar codparc={row.codparc ?? 0} nome={row.nomeColaborador ?? '?'} size="small" sx={{ width: 28, height: 28, flexShrink: 0 }} />
          <Typography fontSize={12} fontWeight={500} noWrap>{row.nomeColaborador ?? row.nomeUsuario ?? '-'}</Typography>
        </Box>
      </Tooltip>
    ) },
    { field: 'placa', headerName: 'Veiculo', width: 140, renderCell: ({ row }) => (<Box sx={{ minWidth: 0 }}><Typography fontSize={12} fontWeight={600} noWrap>{row.placa ?? '-'}</Typography>{row.marcaModelo && <Typography fontSize={9} color="text.disabled" noWrap>{row.marcaModelo}</Typography>}</Box>) },
    { field: 'dtIni', headerName: 'Inicio', width: 120, renderCell: ({ value }) => <Typography sx={{ fontSize: 11 }}>{fmtDateTime(value)}</Typography> },
    { field: 'dtFin', headerName: 'Fim', width: 120, renderCell: ({ value }) => <Typography sx={{ fontSize: 11 }}>{fmtDateTime(value)}</Typography> },
    { field: 'minutos', headerName: 'Duracao', width: 80, align: 'right', headerAlign: 'right', renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{fmtMin(value as number)}</Typography> },
    { field: 'statusOsLabel', headerName: 'Status OS', width: 100, renderCell: ({ row }) => { const c = row.statusOs === 'F' ? 'success' : row.statusOs === 'E' ? 'info' : row.statusOs === 'C' ? 'error' : 'default'; return <Chip label={row.statusOsLabel ?? '-'} size="small" color={c as any} variant="outlined" sx={{ fontSize: 10, height: 22 }} />; } },
    { field: 'observacao', headerName: 'Obs', flex: 1, minWidth: 150, renderCell: ({ value }) => <Tooltip title={value ?? ''} placement="left"><Typography sx={{ fontSize: 11, color: 'text.secondary' }} noWrap>{value || '-'}</Typography></Tooltip> },
  ], []);

  // ── Grupo columns ──
  const grupColumns: GridColDef<PerfExecutor>[] = useMemo(() => [
    { field: 'pos', headerName: '#', width: 40, sortable: false, filterable: false, renderCell: (params) => <Typography sx={{ fontWeight: 600, color: 'text.disabled', fontSize: 11 }}>{params.api.getAllRowIds().indexOf(params.id) + 1}</Typography> },
    { field: 'nomeColaborador', headerName: 'Colaborador', flex: 1, minWidth: 260, renderCell: ({ row }) => { const desligado = row.situacao === '1'; return (
      <Tooltip title={`Usuario: ${row.nomeUsuario} (cod ${row.codusu})`} placement="right" arrow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, opacity: desligado ? 0.5 : 1 }}>
          <FuncionarioAvatar codparc={row.codparc ?? 0} codemp={row.codemp ?? undefined} codfunc={row.codfunc ?? undefined} nome={row.nomeColaborador ?? undefined} size="small" sx={{ width: 36, height: 36, flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}><Stack direction="row" spacing={0.5} alignItems="center"><Typography fontSize={12.5} fontWeight={600} noWrap sx={{ textDecoration: desligado ? 'line-through' : undefined }}>{row.nomeColaborador}</Typography>{desligado && <PersonOff sx={{ fontSize: 13, color: 'error.main' }} />}</Stack><Typography color="text.disabled" fontSize={10} noWrap>{[row.cargo, row.departamento].filter(Boolean).join(' · ')}</Typography></Box>
        </Box>
      </Tooltip>
    ); } },
    { field: 'totalExecucoes', headerName: 'Execucoes', width: 140, renderCell: ({ value }) => { const pct = maxExec > 0 ? ((value as number) / maxExec) * 100 : 0; return (<Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}><Typography sx={{ fontSize: 12, fontWeight: 700, minWidth: 24, textAlign: 'right' }}>{value}</Typography><LinearProgress variant="determinate" value={pct} sx={{ flex: 1, height: 6, borderRadius: 1, bgcolor: (t) => alpha(t.palette.primary.main, 0.08), '& .MuiLinearProgress-bar': { borderRadius: 1, bgcolor: pct > 66 ? 'primary.main' : pct > 33 ? 'warning.main' : 'text.disabled' } }} /></Box>); } },
    { field: 'mediaMinutos', headerName: 'Media', width: 75, align: 'right', headerAlign: 'right', renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{fmtMin(value as number)}</Typography> },
    { field: 'minMinutos', headerName: 'Min', width: 65, align: 'right', headerAlign: 'right', renderCell: ({ value }) => <Typography sx={{ fontSize: 11, color: 'success.main' }}>{fmtMin(value as number)}</Typography> },
    { field: 'maxMinutos', headerName: 'Max', width: 65, align: 'right', headerAlign: 'right', renderCell: ({ value }) => <Typography sx={{ fontSize: 11, color: 'error.main' }}>{fmtMin(value as number)}</Typography> },
    { field: 'totalMinutos', headerName: 'Total', width: 75, align: 'right', headerAlign: 'right', renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{(value as number) > 0 ? `${((value as number) / 60).toFixed(1)}h` : '-'}</Typography> },
    { field: 'primeiraExec', headerName: 'Primeira', width: 88, align: 'center', headerAlign: 'center', renderCell: ({ value }) => <Typography sx={{ fontSize: 11 }}>{fmtDate(value as string)}</Typography> },
    { field: 'ultimaExec', headerName: 'Ultima', width: 88, align: 'center', headerAlign: 'center', renderCell: ({ value }) => <Typography sx={{ fontSize: 11 }}>{fmtDate(value as string)}</Typography> },
  ], [maxExec]);

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <Box sx={{ width: 340, flexShrink: 0, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ServicoList codprod={codprod} onSelect={handleSelect} />
      </Box>

      {!codprod ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack alignItems="center" spacing={1}>
            <TouchApp sx={{ fontSize: 28, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>Selecione um servico</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>Escolha na lista ao lado para ver execucoes</Typography>
          </Stack>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {viewMode === 'exec' ? (
            <DataGrid rows={filteredExecRows} columns={execColumns}
              getRowId={(row) => `${row.nuos}-${row.sequencia}-${row.codusu ?? 0}`}
              loading={isLoading} rowHeight={48} disableRowSelectionOnClick showToolbar
              checkboxSelection
              rowSelectionModel={execSelection} onRowSelectionModelChange={setExecSelection}
              slots={{ toolbar: EficienciaToolbar }} slotProps={{ toolbar: toolbarProps }}
              pageSizeOptions={[25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
              localeText={LOCALE} sx={gridSx} />
          ) : (
            <DataGrid rows={allGrupRows} columns={grupColumns}
              getRowId={(row) => `${row.codusu}-${row.situacao ?? 'x'}`}
              loading={isLoading} rowHeight={52} disableRowSelectionOnClick showToolbar
              checkboxSelection
              rowSelectionModel={grupSelection} onRowSelectionModelChange={setGrupSelection}
              slots={{ toolbar: EficienciaToolbar }} slotProps={{ toolbar: toolbarProps }}
              pageSizeOptions={[25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 50 } }, sorting: { sortModel: [{ field: 'totalExecucoes', sort: 'desc' }] } }}
              localeText={LOCALE} sx={gridSx} />
          )}
        </Box>
      )}

      {/* Quartil Dialog */}
      <QuartilDialog
        open={quartilOpen} onClose={() => setQuartilOpen(false)}
        servicoNome={selectedServico?.descrProd ?? ''}
        execucoes={filteredExecRows} executores={allGrupRows}
        excludedIds={excludedIds} />
    </Box>
  );
}
