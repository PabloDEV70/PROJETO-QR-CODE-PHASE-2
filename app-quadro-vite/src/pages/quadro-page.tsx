import { useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box, Typography, Chip, Stack, TextField, InputAdornment,
  Tooltip, Divider, Badge, Menu, MenuItem, ListItemText,
  ToggleButtonGroup, ToggleButton, alpha, IconButton, Button,
  Paper,
} from '@mui/material';
import {
  Search, Edit, Warning, ViewColumn, FilterList, FileDownload,
  FiberManualRecord, Add, Person, TableChart, ViewKanban,
  GridView, Schedule, AddCircleOutline,
} from '@mui/icons-material';
import {
  DataGrid, type GridColDef,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv, ExportPrint,
  QuickFilter, QuickFilterControl, QuickFilterTrigger,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { useHstVeiPainel } from '@/hooks/use-hstvei';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import type { PainelVeiculo } from '@/types/hstvei-types';

// ── Helpers ──

const PRI_COLORS: Record<string, string> = { URG: '#f44336', ALT: '#ff9800', NOR: '#4caf50', BAI: '#9e9e9e' };

const DEP_OPTIONS = [
  'Todos', 'Comercial', 'Manutencao', 'Logistica', 'Operacao',
  'Seguranca', 'Programacao', 'Compras',
] as const;

type TimeFilter = 'ativos' | 'recentes' | 'atrasados';
type ViewMode = 'tabela' | 'kanban' | 'cards';

function fmtDate(val: string | null | undefined): string {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('pt-BR');
}

function isOverdue(val: string | null | undefined): boolean {
  if (!val) return false;
  return new Date(val) < new Date();
}

function daysDiff(val: string): number {
  const d = new Date(val);
  if (isNaN(d.getTime())) return 9999;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

// ── Flat row ──

interface QuadroRow {
  id: number;
  codveiculo: number;
  placa: string;
  tag: string;
  marcaModelo: string;
  tipo: string;
  situacao: string;
  departamento: string;
  prioridadeSigla: string;
  prioridadeDescricao: string;
  cliente: string;
  equipe: string;
  dtinicio: string | null;
  dtprevisao: string | null;
  descricao: string;
  diasAtivo: number;
}

function buildRows(veiculos: PainelVeiculo[]): QuadroRow[] {
  const rows: QuadroRow[] = [];
  for (const v of veiculos) {
    for (const s of v.situacoesAtivas) {
      const ops = s.operadores?.map((o) => o.nome?.split(' ')[0]).join(', ') ?? '';
      const mecs = s.mecanicos?.map((m) => m.nome?.split(' ')[0]).join(', ') ?? '';
      const equipe = [ops, mecs].filter(Boolean).join(' | ');
      rows.push({
        id: s.id,
        codveiculo: v.codveiculo,
        placa: v.placa ?? '-',
        tag: v.tag ?? '',
        marcaModelo: v.marcaModelo ?? '',
        tipo: v.tipo ?? '',
        situacao: s.situacao ?? '-',
        departamento: s.departamento ?? '-',
        prioridadeSigla: s.prioridadeSigla ?? '-',
        prioridadeDescricao: s.prioridadeDescricao ?? '',
        cliente: s.nomeParc ?? s.mosCliente ?? '',
        equipe,
        dtinicio: s.dtinicio ?? null,
        dtprevisao: s.dtprevisao ?? null,
        descricao: s.descricao ?? '',
        diasAtivo: s.dtinicio ? daysDiff(s.dtinicio) : 0,
      });
    }
  }
  return rows;
}

// ── Styled QuickFilter ──

type OwnerState = { expanded: boolean };
const StyledQuickFilter = styled(QuickFilter)({ display: 'grid', alignItems: 'center' });
const StyledSearchTrigger = styled(ToolbarButton)<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({
  gridArea: '1 / 1', width: 'min-content', height: 'min-content', zIndex: 1,
  opacity: ownerState.expanded ? 0 : 1, pointerEvents: ownerState.expanded ? 'none' : 'auto',
  transition: theme.transitions.create(['opacity']),
}));
const StyledSearchField = styled(TextField)<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({
  gridArea: '1 / 1', overflowX: 'clip',
  width: ownerState.expanded ? 220 : 'var(--trigger-width)',
  opacity: ownerState.expanded ? 1 : 0,
  transition: theme.transitions.create(['width', 'opacity']),
}));

const TOGGLE_SX = {
  height: 28,
  '& .MuiToggleButton-root': { textTransform: 'none' as const, fontSize: 11, fontWeight: 600, px: 1.2, py: 0 },
};

// ══════════════════════════════════════
// KANBAN VIEW
// ══════════════════════════════════════

const KANBAN_COLUMNS = [
  { key: 'saindo', label: 'Saindo', color: '#2e7d32', bg: '#e8f5e9', sits: new Set(['Agendado', 'Mobilizando', 'Checklist Saida', 'Separacao Materiais', 'Carregamento']) },
  { key: 'transito', label: 'Em Transito', color: '#1565c0', bg: '#e3f2fd', sits: new Set(['Em Trânsito', 'Entregue']) },
  { key: 'operando', label: 'Em Operacao', color: '#00838f', bg: '#e0f7fa', sits: new Set(['Em Serviço', 'Em Contrato']) },
  { key: 'retornando', label: 'Retornando', color: '#e65100', bg: '#fff3e0', sits: new Set(['Desmobilizando', 'Retorno Pendente']) },
  { key: 'patio', label: 'No Patio', color: '#546e7a', bg: '#eceff1', sits: new Set(['No Pátio', 'Disponível', 'Checklist Patio']) },
  { key: 'manutencao', label: 'Manutencao', color: '#ff9800', bg: '#fff8e1', sits: new Set(['Em Manutenção', 'Em Planejamento', 'Aguardando Peça', 'Pausada', 'Serviço Terceiro']) },
  { key: 'outros', label: 'Outros', color: '#9e9e9e', bg: '#fafafa', sits: new Set<string>() },
];

function categorizeRow(row: QuadroRow): string {
  for (const col of KANBAN_COLUMNS) {
    if (col.sits.has(row.situacao)) return col.key;
  }
  return 'outros';
}

function KanbanCard({ row }: { row: QuadroRow }) {
  const navigate = useNavigate();
  const priColor = PRI_COLORS[row.prioridadeSigla] ?? '#9e9e9e';
  const depInfo = getDepartamentoInfo(row.departamento);
  const overdue = isOverdue(row.dtprevisao);

  return (
    <Paper
      onClick={() => navigate(`/situacao/${row.id}`)}
      elevation={0}
      sx={{
        borderRadius: '10px',
        p: 1.5, mb: 1,
        border: '1px solid', borderColor: 'divider',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderColor: 'primary.light',
        },
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      {/* Overdue banner */}
      {overdue && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.5,
          px: 1, py: 0.3, mb: 1, mx: -0.5, mt: -0.5,
          bgcolor: 'error.light', borderRadius: '6px',
        }}>
          <Warning sx={{ fontSize: 13, color: 'error.main' }} />
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'error.main', letterSpacing: '0.04em' }}>
            ATRASADO
          </Typography>
        </Box>
      )}

      {/* Placa centralizada grande no topo */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <PlacaVeiculo placa={row.placa} scale={0.6} />
      </Box>

      {/* Tag + modelo + prioridade */}
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
        {row.tag && (
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: 'text.primary', fontFamily: '"JetBrains Mono", monospace' }}>
            {row.tag}
          </Typography>
        )}
        {row.marcaModelo && (
          <Typography sx={{ fontSize: 10, color: 'text.disabled', flex: 1 }} noWrap>{row.marcaModelo}</Typography>
        )}
        <Box sx={{ flex: row.marcaModelo ? undefined : 1 }} />
        <Box sx={{ px: 0.6, py: 0.15, borderRadius: '4px', bgcolor: alpha(priColor, 0.1) }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: priColor }}>{row.prioridadeSigla}</Typography>
        </Box>
      </Stack>

      {/* Situacao chip */}
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.3,
        mb: 0.75, fontSize: 10.5, fontWeight: 600,
        color: depInfo.color,
        bgcolor: depInfo.bgLight,
        px: 0.75, py: 0.15, borderRadius: '4px',
      }}>
        <depInfo.Icon sx={{ fontSize: 11 }} />
        {row.situacao}
      </Box>

      {/* Descricao */}
      {row.descricao && (
        <Typography sx={{
          fontSize: 12.5, lineHeight: 1.45, color: 'text.secondary', fontWeight: 400,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', mb: 1,
        }}>
          {row.descricao}
        </Typography>
      )}

      {/* Cliente */}
      {row.cliente && (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, mb: 0.75, fontSize: 10.5, fontWeight: 500, color: 'text.disabled' }}>
          <Person sx={{ fontSize: 12 }} />
          <Typography sx={{ fontSize: 10.5, maxWidth: 180 }} noWrap>{row.cliente}</Typography>
        </Box>
      )}

      {/* Footer */}
      <Stack direction="row" alignItems="center" spacing={0.5}
        sx={{ color: 'text.disabled', pt: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Schedule sx={{ fontSize: 12 }} />
        <Typography sx={{ fontSize: 10.5 }}>{fmtDate(row.dtinicio)}</Typography>
        {row.dtprevisao && (
          <>
            <Box sx={{ width: 1, height: 10, bgcolor: 'divider', mx: 0.25 }} />
            <Typography sx={{
              fontSize: 10.5,
              color: overdue ? 'error.main' : 'inherit',
              fontWeight: overdue ? 700 : 400,
            }}>
              → {fmtDate(row.dtprevisao)}
            </Typography>
          </>
        )}
        <Box sx={{ flex: 1 }} />
        {row.equipe && (
          <Typography sx={{ maxWidth: 80, fontSize: 10.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.equipe}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

function KanbanView({ rows }: { rows: QuadroRow[] }) {
  const navigate = useNavigate();
  const grouped = useMemo(() => {
    const map = new Map<string, QuadroRow[]>();
    for (const col of KANBAN_COLUMNS) map.set(col.key, []);
    for (const row of rows) {
      const key = categorizeRow(row);
      map.get(key)?.push(row);
    }
    return map;
  }, [rows]);

  return (
    <Box sx={{
      flex: 1, display: 'flex', gap: 1.5, overflowX: 'auto', pb: 2,
      alignItems: 'stretch', minHeight: 420,
      scrollSnapType: 'x mandatory',
      WebkitOverflowScrolling: 'touch',
      px: 1, pt: 1,
      '&::-webkit-scrollbar': { height: 6 },
      '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: 3 },
    }}>
      {KANBAN_COLUMNS.map((col) => {
        const items = grouped.get(col.key) ?? [];
        if (items.length === 0 && col.key === 'outros') return null;
        return (
          <Box key={col.key} sx={{
            minWidth: 290, flex: '0 0 290px',
            scrollSnapAlign: 'start',
            display: 'flex', flexDirection: 'column',
            bgcolor: (t) => t.palette.mode === 'dark' ? alpha(col.color, 0.06) : alpha(col.bg, 0.6),
            borderRadius: '12px',
            border: '1px solid',
            borderColor: (t) => t.palette.mode === 'dark' ? alpha(col.color, 0.15) : alpha(col.color, 0.12),
            '@media (min-width: 600px)': { minWidth: 310, flex: '0 0 310px' },
          }}>
            {/* Column header */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 1.5, py: 1, borderBottom: '1px solid', borderColor: alpha(col.color, 0.15),
            }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: col.color, flexShrink: 0 }} />
              <Typography sx={{
                fontSize: 12, fontWeight: 700, color: col.color,
                letterSpacing: '0.04em', flex: 1, textTransform: 'uppercase',
              }}>
                {col.label}
              </Typography>
              <Chip label={items.length} size="small" sx={{
                height: 22, minWidth: 28, fontWeight: 800, fontSize: 12,
                bgcolor: alpha(col.color, 0.12), color: col.color, borderRadius: '6px',
              }} />
              <Tooltip title={`Nova situacao em ${col.label}`}>
                <IconButton size="small" onClick={() => navigate('/nova-situacao')}
                  sx={{ color: col.color, p: 0.25 }}>
                  <AddCircleOutline sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Cards */}
            <Box sx={{
              flex: 1, overflowY: 'auto', p: 0.75,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: alpha(col.color, 0.15), borderRadius: 2 },
            }}>
              {items.length === 0 ? (
                <Box sx={{
                  py: 4, textAlign: 'center',
                  border: '1px dashed', borderColor: alpha(col.color, 0.2),
                  borderRadius: '10px', bgcolor: alpha(col.color, 0.04),
                }}>
                  <AddCircleOutline sx={{ fontSize: 28, color: alpha(col.color, 0.25), mb: 0.5 }} />
                  <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 500 }}>
                    Nenhum
                  </Typography>
                </Box>
              ) : items.map((row) => (
                <KanbanCard key={row.id} row={row} />
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ══════════════════════════════════════
// CARDS VIEW
// ══════════════════════════════════════

function CardView({ rows }: { rows: QuadroRow[] }) {
  const navigate = useNavigate();
  return (
    <Box sx={{
      flex: 1, overflow: 'auto', p: 1,
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: 'repeat(4, 1fr)' },
      gap: 1.5, alignContent: 'start',
    }}>
      {rows.map((row) => {
        const depInfo = getDepartamentoInfo(row.departamento);
        const priColor = PRI_COLORS[row.prioridadeSigla] ?? '#9e9e9e';
        const overdue = isOverdue(row.dtprevisao);
        return (
          <Paper
            key={row.id}
            onClick={() => navigate(`/situacao/${row.id}`)}
            sx={{
              p: 2, cursor: 'pointer', borderRadius: 2,
              borderTop: `4px solid ${depInfo.color}`,
              transition: 'box-shadow 0.15s',
              '&:hover': { boxShadow: 4 },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <PlacaVeiculo placa={row.placa} scale={0.65} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              {row.tag && (
                <Typography sx={{ fontSize: 15, fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color: 'text.primary' }}>
                  {row.tag}
                </Typography>
              )}
              <Typography sx={{ fontSize: 11, color: 'text.secondary', flex: 1 }} noWrap>{row.marcaModelo}</Typography>
              <Chip
                icon={<FiberManualRecord sx={{ fontSize: '8px !important', color: `${priColor} !important` }} />}
                label={row.prioridadeSigla}
                size="small"
                sx={{ height: 22, fontSize: 10, fontWeight: 700 }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
              <Chip label={row.situacao} size="small" sx={{ fontSize: 10, fontWeight: 600, height: 22, bgcolor: depInfo.bgLight, color: depInfo.color }} />
              {overdue && <Warning sx={{ fontSize: 14, color: '#e53935' }} />}
            </Box>

            {row.cliente && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600 }} noWrap>{row.cliente}</Typography>
              </Box>
            )}

            {row.descricao && (
              <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.75 }} noWrap>{row.descricao}</Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 'auto' }}>
              <Typography sx={{ fontSize: 10, color: 'text.disabled', fontFamily: 'monospace' }}>
                {fmtDate(row.dtinicio)}
              </Typography>
              {row.dtprevisao && (
                <Typography sx={{
                  fontSize: 10, fontFamily: 'monospace', fontWeight: overdue ? 700 : 400,
                  color: overdue ? 'error.main' : 'text.disabled',
                }}>
                  → {fmtDate(row.dtprevisao)}
                </Typography>
              )}
              {row.equipe && (
                <Typography sx={{ fontSize: 9, color: 'text.disabled', ml: 'auto' }} noWrap>{row.equipe}</Typography>
              )}
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}

// ══════════════════════════════════════
// TOOLBAR
// ══════════════════════════════════════

interface QuadroToolbarProps {
  dep: string;
  onDepChange: (v: string) => void;
  time: TimeFilter;
  onTimeChange: (v: TimeFilter) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  totalRows: number;
  totalVeiculos: number;
  atrasados: number;
}

function QuadroToolbar({ dep, onDepChange, time, onTimeChange, view, onViewChange, totalRows, totalVeiculos, atrasados }: QuadroToolbarProps) {
  const navigate = useNavigate();
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLButtonElement>(null);

  return (
    <Toolbar>
      <Typography fontWeight={700} fontSize={14} sx={{ mr: 1 }}>Quadro</Typography>
      <Chip label={`${totalRows} sit.`} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, mr: 0.5 }} />
      <Chip label={`${totalVeiculos} veic.`} size="small" variant="outlined" sx={{ height: 22, fontSize: 10, mr: 0.5 }} />
      {atrasados > 0 && (
        <Chip icon={<Warning sx={{ fontSize: '12px !important' }} />} label={`${atrasados}`} size="small"
          sx={{ height: 22, fontSize: 10, fontWeight: 700, bgcolor: alpha('#f44336', 0.08), color: '#e53935', '& .MuiChip-icon': { color: '#e53935' } }} />
      )}

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      {/* View mode */}
      <ToggleButtonGroup value={view} exclusive onChange={(_, v) => { if (v) onViewChange(v); }} size="small" sx={TOGGLE_SX}>
        <ToggleButton value="tabela"><Tooltip title="Tabela"><TableChart sx={{ fontSize: 16 }} /></Tooltip></ToggleButton>
        <ToggleButton value="kanban"><Tooltip title="Kanban"><ViewKanban sx={{ fontSize: 16 }} /></Tooltip></ToggleButton>
        <ToggleButton value="cards"><Tooltip title="Cards"><GridView sx={{ fontSize: 16 }} /></Tooltip></ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      {/* Time filter */}
      <ToggleButtonGroup value={time} exclusive onChange={(_, v) => { if (v) onTimeChange(v); }} size="small" sx={TOGGLE_SX}>
        <ToggleButton value="ativos">Ativos</ToggleButton>
        <ToggleButton value="recentes">30d</ToggleButton>
        <ToggleButton value="atrasados" sx={{
          '&.Mui-selected': { bgcolor: alpha('#f44336', 0.12), color: '#e53935' },
        }}>Atrasados</ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      {/* Dept filter */}
      <ToggleButtonGroup value={dep} exclusive onChange={(_, v) => { if (v) onDepChange(v); }} size="small" sx={TOGGLE_SX}>
        {DEP_OPTIONS.map((d) => {
          const info = d === 'Todos' ? null : getDepartamentoInfo(d);
          return (
            <ToggleButton key={d} value={d} sx={info ? {
              '&.Mui-selected': { bgcolor: alpha(info.color, 0.12), color: info.color },
            } : undefined}>
              {d}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>

      <div style={{ flex: 1 }} />

      <Tooltip title="Nova situacao">
        <Button size="small" variant="contained" startIcon={<Add />} onClick={() => navigate('/nova-situacao')}
          sx={{ mr: 1, fontSize: 11, fontWeight: 700, textTransform: 'none', px: 1.5, py: 0.25 }}>
          Nova
        </Button>
      </Tooltip>

      {view === 'tabela' && (
        <>
          <Tooltip title="Colunas"><ColumnsPanelTrigger render={<ToolbarButton />}><ViewColumn fontSize="small" /></ColumnsPanelTrigger></Tooltip>
          <Tooltip title="Filtros avancados">
            <FilterPanelTrigger render={(fp, state) => (
              <ToolbarButton {...fp} color="default"><Badge badgeContent={state.filterCount} color="primary" variant="dot"><FilterList fontSize="small" /></Badge></ToolbarButton>
            )} />
          </Tooltip>
          <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="Exportar"><ToolbarButton ref={exportRef} onClick={() => setExportOpen(true)}><FileDownload fontSize="small" /></ToolbarButton></Tooltip>
          <Menu anchorEl={exportRef.current} open={exportOpen} onClose={() => setExportOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <ExportPrint render={<MenuItem />} onClick={() => setExportOpen(false)}><ListItemText>Imprimir</ListItemText></ExportPrint>
            <ExportCsv render={<MenuItem />} onClick={() => setExportOpen(false)}><ListItemText>Baixar CSV</ListItemText></ExportCsv>
          </Menu>
          <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
          <StyledQuickFilter>
            <QuickFilterTrigger render={(triggerProps, state) => (
              <Tooltip title="Buscar"><StyledSearchTrigger {...triggerProps} ownerState={{ expanded: state.expanded }} color="default"><Search fontSize="small" /></StyledSearchTrigger></Tooltip>
            )} />
            <QuickFilterControl render={({ ref, ...controlProps }, state) => (
              <StyledSearchField {...controlProps} ownerState={{ expanded: state.expanded }} inputRef={ref}
                placeholder="Placa, tag, cliente..." size="small"
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }} />
            )} />
          </StyledQuickFilter>
        </>
      )}
    </Toolbar>
  );
}

// ══════════════════════════════════════
// GRID (TABLE VIEW)
// ══════════════════════════════════════

const LOCALE = { ...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhuma situacao encontrada' };

const gridSx = {
  flex: 1, border: 0,
  '& .MuiDataGrid-columnHeaders': { '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12 } },
  '& .MuiDataGrid-row': { cursor: 'pointer', '&:hover': { bgcolor: (t: any) => alpha(t.palette.primary.main, 0.05) } },
  '& .MuiDataGrid-cell': { fontSize: 12, borderColor: 'divider' },
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
} as const;

// ══════════════════════════════════════
// PAGE
// ══════════════════════════════════════

export function QuadroPage() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const dep = sp.get('dep') || 'Todos';
  const time = (sp.get('time') as TimeFilter) || 'ativos';
  const view = (sp.get('view') as ViewMode) || 'tabela';
  const searchParam = sp.get('q') || '';

  const setParam = useCallback((key: string, val: string, def: string) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      if (val === def) next.delete(key); else next.set(key, val);
      return next;
    }, { replace: true });
  }, [setSp]);

  const setDep = useCallback((v: string) => setParam('dep', v, 'Todos'), [setParam]);
  const setTime = useCallback((v: TimeFilter) => setParam('time', v, 'ativos'), [setParam]);
  const setView = useCallback((v: ViewMode) => setParam('view', v, 'tabela'), [setParam]);
  const setSearch = useCallback((v: string) => setParam('q', v, ''), [setParam]);

  const { data, isLoading } = useHstVeiPainel();
  const allRows = useMemo(() => buildRows(data?.veiculos ?? []), [data]);

  const filteredRows = useMemo(() => {
    let rows = allRows;
    if (time === 'recentes') rows = rows.filter((r) => r.diasAtivo <= 30);
    else if (time === 'atrasados') rows = rows.filter((r) => r.dtprevisao && isOverdue(r.dtprevisao));
    if (dep !== 'Todos') rows = rows.filter((r) => r.departamento.toLowerCase().includes(dep.toLowerCase()));
    if (searchParam) {
      const q = searchParam.toLowerCase();
      rows = rows.filter((r) =>
        r.placa.toLowerCase().includes(q)
        || r.tag.toLowerCase().includes(q)
        || r.cliente.toLowerCase().includes(q)
        || r.descricao.toLowerCase().includes(q)
        || r.equipe.toLowerCase().includes(q)
        || r.situacao.toLowerCase().includes(q)
        || r.marcaModelo.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [allRows, dep, time, searchParam]);

  const atrasados = useMemo(() => allRows.filter((r) => r.dtprevisao && isOverdue(r.dtprevisao)).length, [allRows]);
  const totalVeiculos = useMemo(() => new Set(filteredRows.map((r) => r.codveiculo)).size, [filteredRows]);

  const columns: GridColDef<QuadroRow>[] = useMemo(() => [
    {
      field: 'placa', headerName: 'Placa', width: 100,
      renderCell: ({ value }) => <Typography sx={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>{value}</Typography>,
    },
    { field: 'tag', headerName: 'Tag', width: 90, renderCell: ({ value }) => (
      <Typography sx={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'primary.main' }}>{value}</Typography>
    )},
    {
      field: 'situacao', headerName: 'Situacao', width: 150,
      renderCell: ({ row }) => {
        const info = getDepartamentoInfo(row.departamento);
        return <Chip label={row.situacao} size="small" sx={{ fontSize: 10, fontWeight: 600, height: 22, bgcolor: info.bgLight, color: info.color }} />;
      },
    },
    {
      field: 'departamento', headerName: 'Depto', width: 130,
      renderCell: ({ value }) => {
        const info = getDepartamentoInfo(value as string);
        const Icon = info.Icon;
        return <Chip icon={<Icon sx={{ fontSize: '14px !important' }} />} label={info.label} size="small" sx={{ fontSize: 10, height: 22, bgcolor: info.bgLight, color: info.color }} />;
      },
    },
    {
      field: 'prioridadeSigla', headerName: 'Prior.', width: 70, align: 'center', headerAlign: 'center',
      renderCell: ({ row }) => (
        <Tooltip title={row.prioridadeDescricao}>
          <Chip icon={<FiberManualRecord sx={{ fontSize: '10px !important', color: `${PRI_COLORS[row.prioridadeSigla] ?? '#9e9e9e'} !important` }} />}
            label={row.prioridadeSigla} size="small" variant="outlined" sx={{ fontSize: 10, height: 22, fontWeight: 700 }} />
        </Tooltip>
      ),
    },
    {
      field: 'cliente', headerName: 'Cliente / Parceiro', flex: 1, minWidth: 180,
      renderCell: ({ value }) => value ? (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{value as string}</Typography>
        </Stack>
      ) : <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>-</Typography>,
    },
    { field: 'descricao', headerName: 'Descricao', flex: 1, minWidth: 160 },
    { field: 'equipe', headerName: 'Equipe', width: 140 },
    {
      field: 'dtinicio', headerName: 'Inicio', width: 95,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11 }}>{fmtDate(value as string)}</Typography>,
    },
    {
      field: 'dtprevisao', headerName: 'Previsao', width: 110,
      renderCell: ({ value }) => {
        const overdue = isOverdue(value as string);
        return (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography sx={{ fontSize: 11, color: overdue ? 'error.main' : 'text.primary', fontWeight: overdue ? 700 : 400 }}>
              {fmtDate(value as string)}
            </Typography>
            {overdue && <Warning sx={{ fontSize: 14, color: 'error.main' }} />}
          </Stack>
        );
      },
    },
    {
      field: 'diasAtivo', headerName: 'Dias', width: 60, align: 'center', headerAlign: 'center',
      renderCell: ({ value }) => (
        <Typography sx={{
          fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
          color: (value as number) > 30 ? 'error.main' : (value as number) > 7 ? 'warning.main' : 'text.secondary',
        }}>{value}d</Typography>
      ),
    },
    {
      field: 'actions', headerName: '', width: 50, sortable: false, filterable: false,
      renderCell: ({ row }) => (
        <Tooltip title="Editar"><IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/situacao/${row.id}`); }}>
          <Edit sx={{ fontSize: 16 }} />
        </IconButton></Tooltip>
      ),
    },
  ], [navigate]);

  const toolbarProps = useMemo(() => ({
    dep, onDepChange: setDep,
    time, onTimeChange: setTime,
    view, onViewChange: setView,
    totalRows: filteredRows.length, totalVeiculos, atrasados,
  }), [dep, setDep, time, setTime, view, setView, filteredRows.length, totalVeiculos, atrasados]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {view === 'tabela' ? (
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={isLoading}
          density="compact"
          rowHeight={44}
          disableRowSelectionOnClick
          showToolbar
          slots={{
            toolbar: () => <QuadroToolbar {...toolbarProps} />,
          }}
          onRowClick={(params) => navigate(`/situacao/${params.row.id}`)}
          pageSizeOptions={[25, 50, 100, 200]}
          initialState={{
            pagination: { paginationModel: { pageSize: 100 } },
            sorting: { sortModel: [{ field: 'dtinicio', sort: 'desc' }] },
          }}
          localeText={LOCALE}
          sx={gridSx}
        />
      ) : (
        <>
          {/* Toolbar for non-table views (outside DataGrid) */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap',
            px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider',
          }}>
            <Typography fontWeight={700} fontSize={14} sx={{ mr: 1 }}>Quadro</Typography>
            <Chip label={`${filteredRows.length} sit.`} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700 }} />
            <Chip label={`${totalVeiculos} veic.`} size="small" variant="outlined" sx={{ height: 22, fontSize: 10 }} />
            {atrasados > 0 && (
              <Chip icon={<Warning sx={{ fontSize: '12px !important' }} />} label={`${atrasados}`} size="small"
                sx={{ height: 22, fontSize: 10, fontWeight: 700, bgcolor: alpha('#f44336', 0.08), color: '#e53935', '& .MuiChip-icon': { color: '#e53935' } }} />
            )}
            <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
            <ToggleButtonGroup value={view} exclusive onChange={(_, v) => { if (v) setView(v); }} size="small" sx={TOGGLE_SX}>
              <ToggleButton value="tabela"><TableChart sx={{ fontSize: 16 }} /></ToggleButton>
              <ToggleButton value="kanban"><ViewKanban sx={{ fontSize: 16 }} /></ToggleButton>
              <ToggleButton value="cards"><GridView sx={{ fontSize: 16 }} /></ToggleButton>
            </ToggleButtonGroup>
            <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
            <ToggleButtonGroup value={time} exclusive onChange={(_, v) => { if (v) setTime(v); }} size="small" sx={TOGGLE_SX}>
              <ToggleButton value="ativos">Ativos</ToggleButton>
              <ToggleButton value="recentes">30d</ToggleButton>
              <ToggleButton value="atrasados">Atrasados</ToggleButton>
            </ToggleButtonGroup>
            <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
            <ToggleButtonGroup value={dep} exclusive onChange={(_, v) => { if (v) setDep(v); }} size="small" sx={TOGGLE_SX}>
              {DEP_OPTIONS.map((d) => <ToggleButton key={d} value={d}>{d}</ToggleButton>)}
            </ToggleButtonGroup>
            <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
            <TextField
              value={searchParam}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar placa, tag, cliente..."
              size="small"
              sx={{ minWidth: 180, '& .MuiInputBase-root': { height: 30, fontSize: 12 } }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment>,
                },
              }}
            />
            <Box sx={{ flex: 1 }} />
            <Button size="small" variant="contained" startIcon={<Add />} onClick={() => navigate('/nova-situacao')}
              sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none', px: 1.5, py: 0.25 }}>
              Nova
            </Button>
          </Box>

          {view === 'kanban' ? (
            <KanbanView rows={filteredRows} />
          ) : (
            <CardView rows={filteredRows} />
          )}
        </>
      )}
    </Box>
  );
}
