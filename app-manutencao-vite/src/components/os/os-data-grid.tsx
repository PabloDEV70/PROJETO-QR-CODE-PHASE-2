import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DataGrid, type GridColDef,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import {
  Box, Typography, Chip, IconButton, Tooltip, Popover, Button, Stack,
  ToggleButtonGroup, ToggleButton, Divider, alpha, TextField, InputAdornment,
  Badge, Menu, MenuItem, ListItemIcon, ListItemText,
} from '@mui/material';
import {
  ViewColumn, FilterList, FileDownload, Search, Tune,
  PlayArrow, CheckCircle, MoreVert, Comment, OpenInNew,
  ViewList, ViewKanban, Add, Stop, Replay,
  BarChart, BarChartOutlined,
} from '@mui/icons-material';
import { OsStatusBadge, TipoManutBadge, StatusGigBadge } from '@/components/os/os-badges';
import { useChangeOsStatus, useFinalizeOs, useCancelOs, useReopenOs } from '@/hooks/use-os-mutations';
import { useAuthStore } from '@/stores/auth-store';
import type { OrdemServico, OsResumo } from '@/types/os-types';

/* ─── Toolbar props override (v8 pattern) ─── */
interface OsToolbarExtraProps {
  tab?: string;
  onTabChange?: (v: string) => void;
  onNewOs?: () => void;
  filters?: Record<string, string>;
  onSetFilter?: (key: string, value: string) => void;
  showKpis?: boolean;
  onToggleKpis?: () => void;
}

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides extends OsToolbarExtraProps {}
}

const TOGGLE_SX = {
  '& .MuiToggleButton-root': {
    textTransform: 'none' as const,
    fontSize: 11, fontWeight: 600,
    px: 1, py: 0.25,
  },
};

/* ─── Filter Popover ─── */
function OsFilterPopover({ filters, onSetFilter, anchorEl, onClose }: {
  filters: Record<string, string>;
  onSetFilter: (key: string, value: string) => void;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}) {
  const activeCount = [filters.status, filters.manutencao, filters.dataInicio, filters.statusGig].filter(Boolean).length;

  return (
    <Popover open={!!anchorEl} anchorEl={anchorEl} onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <Box sx={{ p: 2.5, minWidth: 320, maxWidth: 400 }}>
        <Typography fontWeight={700} fontSize={14} sx={{ mb: 2 }}>Filtros</Typography>

        <Stack spacing={2}>
          {/* Status */}
          <Box>
            <Typography fontSize={11} fontWeight={600} color="text.secondary" sx={{ mb: 0.75 }}>Status da OS</Typography>
            <ToggleButtonGroup value={filters.status || ''} exclusive
              onChange={(_, v) => onSetFilter('status', v ?? '')}
              size="small" sx={TOGGLE_SX} fullWidth>
              <ToggleButton value="">Todos</ToggleButton>
              <ToggleButton value="A" sx={{ '&.Mui-selected': { bgcolor: alpha('#f59e0b', 0.12), color: '#b45309' } }}>Abertas</ToggleButton>
              <ToggleButton value="E" sx={{ '&.Mui-selected': { bgcolor: alpha('#0ea5e9', 0.12), color: '#0369a1' } }}>Exec.</ToggleButton>
              <ToggleButton value="F" sx={{ '&.Mui-selected': { bgcolor: alpha('#22c55e', 0.12), color: '#15803d' } }}>Final.</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Tipo Manutencao */}
          <Box>
            <Typography fontSize={11} fontWeight={600} color="text.secondary" sx={{ mb: 0.75 }}>Tipo Manutencao</Typography>
            <ToggleButtonGroup value={filters.manutencao || ''} exclusive
              onChange={(_, v) => onSetFilter('manutencao', v ?? '')}
              size="small" sx={TOGGLE_SX} fullWidth>
              <ToggleButton value="">Todos</ToggleButton>
              <ToggleButton value="C" sx={{ '&.Mui-selected': { bgcolor: alpha('#d32f2f', 0.12), color: '#d32f2f' } }}>Corretiva</ToggleButton>
              <ToggleButton value="P" sx={{ '&.Mui-selected': { bgcolor: alpha('#2e7d32', 0.12), color: '#2e7d32' } }}>Preventiva</ToggleButton>
              <ToggleButton value="O">Outros</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Status GIG */}
          <Box>
            <Typography fontSize={11} fontWeight={600} color="text.secondary" sx={{ mb: 0.75 }}>Status GIG</Typography>
            <ToggleButtonGroup value={filters.statusGig || ''} exclusive
              onChange={(_, v) => onSetFilter('statusGig', v ?? '')}
              size="small" sx={TOGGLE_SX} fullWidth>
              <ToggleButton value="">Todos</ToggleButton>
              <ToggleButton value="MA">Manut.</ToggleButton>
              <ToggleButton value="AN">Pecas</ToggleButton>
              <ToggleButton value="AV">Aval.</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Periodo */}
          <Box>
            <Typography fontSize={11} fontWeight={600} color="text.secondary" sx={{ mb: 0.75 }}>Periodo (abertura)</Typography>
            <Stack direction="row" spacing={1}>
              <TextField type="date" size="small" fullWidth
                value={filters.dataInicio || ''} onChange={(e) => onSetFilter('dataInicio', e.target.value)}
                sx={{ '& .MuiInputBase-root': { fontSize: 12, height: 34 } }}
                slotProps={{ inputLabel: { shrink: true } }} label="De" />
              <TextField type="date" size="small" fullWidth
                value={filters.dataFim || ''} onChange={(e) => onSetFilter('dataFim', e.target.value)}
                sx={{ '& .MuiInputBase-root': { fontSize: 12, height: 34 } }}
                slotProps={{ inputLabel: { shrink: true } }} label="Ate" />
            </Stack>
          </Box>

          {/* Limpar */}
          {activeCount > 0 && (
            <Button size="small" variant="text" color="error"
              onClick={() => { onSetFilter('status', ''); onSetFilter('manutencao', ''); onSetFilter('statusGig', ''); onSetFilter('dataInicio', ''); onSetFilter('dataFim', ''); onClose(); }}
              sx={{ textTransform: 'none', fontWeight: 600 }}>
              Limpar todos os filtros ({activeCount})
            </Button>
          )}
        </Stack>
      </Box>
    </Popover>
  );
}

/* ─── OS Toolbar (v8) ─── */
function OsGridToolbar(props: OsToolbarExtraProps) {
  const { tab = 'lista', onTabChange, onNewOs, filters = {}, onSetFilter, showKpis, onToggleKpis } = props;
  const isProd = useAuthStore((s) => s.database) === 'PROD';
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);

  const activeFilterCount = [filters.status, filters.manutencao, filters.dataInicio, filters.statusGig].filter(Boolean).length;

  return (
    <>
      <Toolbar>
        <Typography fontWeight={700} fontSize={14} sx={{ mr: 1 }}>Ordens de Servico</Typography>

        {/* Vista */}
        <ToggleButtonGroup value={tab} exclusive
          onChange={(_, v) => { if (v && onTabChange) onTabChange(v); }}
          size="small" sx={TOGGLE_SX}>
          <ToggleButton value="lista"><ViewList sx={{ fontSize: 16, mr: 0.5 }} />Lista</ToggleButton>
          <ToggleButton value="kanban"><ViewKanban sx={{ fontSize: 16, mr: 0.5 }} />Kanban</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ flex: 1 }} />

        {/* Busca */}
        <TextField
          value={filters.search || ''}
          onChange={(e) => onSetFilter?.('search', e.target.value)}
          placeholder="OS, placa, modelo..."
          size="small"
          sx={{ minWidth: 200, '& .MuiInputBase-root': { height: 30, fontSize: 12 } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment> } }}
        />

        {/* Filtros customizados (popover) */}
        <Tooltip title="Filtros avancados">
          <ToolbarButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
            <Badge badgeContent={activeFilterCount} color="primary" variant="dot" invisible={activeFilterCount === 0}>
              <Tune fontSize="small" />
            </Badge>
          </ToolbarButton>
        </Tooltip>

        {/* Chips de filtros ativos */}
        {filters.status && <Chip label={filters.status === 'A' ? 'Abertas' : filters.status === 'E' ? 'Exec.' : filters.status === 'F' ? 'Final.' : filters.status} size="small" onDelete={() => onSetFilter?.('status', '')} sx={{ height: 22, fontSize: 10 }} />}
        {filters.manutencao && <Chip label={filters.manutencao === 'C' ? 'Corretiva' : filters.manutencao === 'P' ? 'Preventiva' : 'Outros'} size="small" onDelete={() => onSetFilter?.('manutencao', '')} sx={{ height: 22, fontSize: 10 }} />}
        {filters.dataInicio && <Chip label={`De ${new Date(filters.dataInicio).toLocaleDateString('pt-BR')}`} size="small" onDelete={() => { onSetFilter?.('dataInicio', ''); onSetFilter?.('dataFim', ''); }} sx={{ height: 22, fontSize: 10 }} />}

        {onToggleKpis && (
          <Tooltip title={showKpis ? 'Ocultar indicadores' : 'Mostrar indicadores'}>
            <ToolbarButton onClick={onToggleKpis} color={showKpis ? 'primary' : 'default'}>
              {showKpis ? <BarChart fontSize="small" /> : <BarChartOutlined fontSize="small" />}
            </ToolbarButton>
          </Tooltip>
        )}

        <ColumnsPanelTrigger render={<ToolbarButton />}><ViewColumn fontSize="small" /></ColumnsPanelTrigger>
        <FilterPanelTrigger render={<ToolbarButton />}><FilterList fontSize="small" /></FilterPanelTrigger>
        <ExportCsv render={<ToolbarButton />}><FileDownload fontSize="small" /></ExportCsv>

        <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

        <ToolbarButton disabled={isProd} onClick={onNewOs} color="success">
          <Add fontSize="small" />
        </ToolbarButton>
      </Toolbar>

      {onSetFilter && (
        <OsFilterPopover filters={filters} onSetFilter={onSetFilter} anchorEl={filterAnchor} onClose={() => setFilterAnchor(null)} />
      )}
    </>
  );
}

/* ─── Grid Props ─── */
interface Props {
  ordens: OrdemServico[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  tab: string;
  onTabChange: (tab: string) => void;
  onNewOs: () => void;
  resumo?: OsResumo;
  filters: Record<string, string>;
  onSetFilter: (key: string, value: string) => void;
  onClearFilters: () => void;
  showKpis?: boolean;
  onToggleKpis?: () => void;
}

const LOCAL_MAP: Record<string, string> = { '1': 'Oficina', '2': 'Campo', '3': 'Terceiro' };

function fmtDateTime(v: string | null | undefined): string {
  if (!v) return '-';
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return String(v); }
}

/* ─── Actions Menu (per row) ─── */
function ActionsMenu({ row, navigate, onAction }: {
  row: OrdemServico;
  navigate: (path: string) => void;
  onAction: (e: React.MouseEvent<HTMLElement>, nuos: number, action: string) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}>
        <MoreVert sx={{ fontSize: 18 }} />
      </IconButton>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => { setAnchor(null); navigate(`/ordens-de-servico/${row.NUOS}`); }}>
          <ListItemIcon><OpenInNew fontSize="small" /></ListItemIcon>
          <ListItemText>Abrir detalhes</ListItemText>
        </MenuItem>
        {row.STATUS === 'A' && (
          <MenuItem onClick={(e) => { setAnchor(null); onAction(e, row.NUOS, 'start'); }}>
            <ListItemIcon><PlayArrow fontSize="small" color="info" /></ListItemIcon>
            <ListItemText>Iniciar execucao</ListItemText>
          </MenuItem>
        )}
        {row.STATUS === 'E' && (
          <MenuItem onClick={(e) => { setAnchor(null); onAction(e, row.NUOS, 'finalize'); }}>
            <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>Finalizar OS</ListItemText>
          </MenuItem>
        )}
        {(row.STATUS === 'F' || row.STATUS === 'C') && (
          <MenuItem onClick={(e) => { setAnchor(null); onAction(e, row.NUOS, 'reopen'); }}>
            <ListItemIcon><Replay fontSize="small" color="warning" /></ListItemIcon>
            <ListItemText>Reabrir OS</ListItemText>
          </MenuItem>
        )}
        {row.STATUS === 'E' && (
          <MenuItem onClick={(e) => { setAnchor(null); onAction(e, row.NUOS, 'cancel'); }}>
            <ListItemIcon><Stop fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Cancelar OS</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

const LOCALE = {
  ...ptBR.components.MuiDataGrid.defaultProps.localeText,
  noRowsLabel: 'Nenhuma OS encontrada',
  toolbarQuickFilterPlaceholder: 'Buscar...',
  MuiTablePagination: {
    labelRowsPerPage: 'Linhas:',
    labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
      `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`,
  },
};

const gridSx = {
  flex: 1, border: 0,
  '& .MuiDataGrid-columnHeaders': {
    bgcolor: 'rgba(46,125,50,0.04)',
    '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.03em' },
  },
  '& .MuiDataGrid-row': {
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.012)' },
    '&:hover': { bgcolor: (t: any) => alpha(t.palette.primary.main, 0.05) },
  },
  '& .MuiDataGrid-cell': {
    fontSize: 12.5, borderColor: 'divider',
    display: 'flex', alignItems: 'center',
  },
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
    outline: 'none',
  },
  '& .MuiDataGrid-footerContainer': { borderTop: 1, borderColor: 'divider', minHeight: 44 },
  '& .MuiDataGrid-scrollbarFiller': { display: 'none' },
} as const;

/* ─── Component ─── */
export function OsDataGrid({
  ordens, isLoading, page, limit, total,
  onPageChange, onPageSizeChange,
  tab, onTabChange, onNewOs, resumo,
  filters, onSetFilter,
  showKpis, onToggleKpis,
}: Props) {
  const navigate = useNavigate();
  const changeStatus = useChangeOsStatus();
  const finalizeOs = useFinalizeOs();
  const cancelOs = useCancelOs();
  const reopenOs = useReopenOs();
  const [confirmAnchor, setConfirmAnchor] = useState<{ el: HTMLElement; nuos: number; action: string } | null>(null);

  const handleQuickAction = (e: React.MouseEvent<HTMLElement>, nuos: number, action: string) => {
    e.stopPropagation();
    setConfirmAnchor({ el: e.currentTarget, nuos, action });
  };

  const executeAction = () => {
    if (!confirmAnchor) return;
    const { nuos, action } = confirmAnchor;
    if (action === 'start') changeStatus.mutate([nuos, 'E']);
    if (action === 'finalize') finalizeOs.mutate([nuos]);
    if (action === 'cancel') cancelOs.mutate([nuos]);
    if (action === 'reopen') reopenOs.mutate([nuos]);
    setConfirmAnchor(null);
  };

  const columns: GridColDef<OrdemServico>[] = useMemo(() => [
    { field: 'NUOS', headerName: 'OS', width: 80,
      renderCell: ({ value, row }) => (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, fontFamily: 'monospace' }}>#{value}</Typography>
          {row.OBSERVACAO && <Tooltip title={String(row.OBSERVACAO).substring(0, 300)} arrow placement="right"><Comment sx={{ fontSize: 13, color: 'text.disabled', cursor: 'help' }} /></Tooltip>}
        </Stack>
      ),
    },
    { field: 'STATUS', headerName: 'Status', width: 115, type: 'singleSelect',
      valueOptions: [{ value: 'A', label: 'Aberta' }, { value: 'E', label: 'Em Execucao' }, { value: 'F', label: 'Finalizada' }, { value: 'C', label: 'Cancelada' }, { value: 'R', label: 'Reaberta' }],
      renderCell: ({ row }) => <OsStatusBadge status={row.STATUS} size="sm" />,
    },
    { field: 'PLACA', headerName: 'Veiculo', minWidth: 160, flex: 1,
      renderCell: ({ row }) => (
        <Box sx={{ py: 0.75, overflow: 'hidden' }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}>{row.PLACA ?? '-'}{row.AD_TAG ? ` (${row.AD_TAG})` : ''}</Typography>
          {row.MARCAMODELO && <Typography noWrap sx={{ fontSize: 10, color: 'text.disabled', lineHeight: 1.2 }}>{row.MARCAMODELO}</Typography>}
        </Box>
      ),
    },
    { field: 'MANUTENCAO', headerName: 'Tipo', width: 110, type: 'singleSelect',
      valueOptions: [{ value: 'C', label: 'Corretiva' }, { value: 'P', label: 'Preventiva' }, { value: 'O', label: 'Outros' }, { value: 'S', label: 'Socorro' }, { value: 'R', label: 'Reforma' }, { value: '2', label: 'Corretiva Prog.' }, { value: '5', label: 'Borracharia' }],
      renderCell: ({ row }) => <TipoManutBadge tipo={row.MANUTENCAO} size="sm" />,
    },
    { field: 'TIPO', headerName: 'I/E', width: 60, type: 'singleSelect',
      valueOptions: [{ value: 'I', label: 'Interna' }, { value: 'E', label: 'Externa' }],
      renderCell: ({ row }) => <Chip label={row.tipoLabel ?? row.TIPO ?? '-'} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 600, bgcolor: row.TIPO === 'I' ? 'info.main' : row.TIPO === 'E' ? 'warning.main' : 'action.hover', color: row.TIPO ? '#fff' : 'text.secondary', borderRadius: '4px' }} />,
    },
    { field: 'AD_STATUSGIG', headerName: 'Status GIG', width: 125, type: 'singleSelect',
      valueOptions: [{ value: 'MA', label: 'Manutencao' }, { value: 'AI', label: 'Aguard. Pecas (Imp)' }, { value: 'AV', label: 'Avaliacao' }, { value: 'AN', label: 'Aguard. Pecas' }, { value: 'SI', label: 'Servico (Imp)' }, { value: 'SN', label: 'Servico Terc.' }],
      renderCell: ({ row }) => <StatusGigBadge statusGig={row.AD_STATUSGIG} />,
    },
    { field: 'NOMEMOTORISTA', headerName: 'Motorista', width: 140,
      renderCell: ({ value }) => <Typography noWrap sx={{ fontSize: 11.5, color: 'text.secondary' }}>{value ?? '-'}</Typography>,
    },
    { field: 'NOMEPARC', headerName: 'Parceiro', width: 150,
      renderCell: ({ value }) => <Typography noWrap sx={{ fontSize: 11.5, color: 'text.secondary' }}>{value ?? '-'}</Typography>,
    },
    { field: 'NOMEEMPRESA', headerName: 'Empresa', width: 130,
      renderCell: ({ value }) => <Typography noWrap sx={{ fontSize: 11.5, color: 'text.secondary' }}>{value ?? '-'}</Typography>,
    },
    { field: 'AD_LOCALMANUTENCAO', headerName: 'Local', width: 75, type: 'singleSelect',
      valueOptions: [{ value: '1', label: 'Oficina' }, { value: '2', label: 'Campo' }, { value: '3', label: 'Terceiro' }],
      renderCell: ({ row }) => <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{row.localLabel ?? '-'}</Typography>,
    },
    { field: 'TOTAL_SERVICOS', headerName: 'Serv.', width: 50, align: 'center', headerAlign: 'center', type: 'number',
      renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{value ?? 0}</Typography>,
    },
    { field: 'CUSTO_TOTAL', headerName: 'Custo', width: 95, align: 'right', headerAlign: 'right', type: 'number',
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11.5, fontFamily: 'monospace', color: 'text.secondary' }}>{value && value > 0 ? `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</Typography>,
    },
    { field: 'DTABERTURA', headerName: 'Abertura', width: 125,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11.5, fontFamily: 'monospace', color: 'text.primary' }}>{fmtDateTime(value as string)}</Typography>,
    },
    { field: 'DATAINI', headerName: 'Inicio Exec.', width: 125,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11.5, fontFamily: 'monospace', color: value ? 'info.main' : 'text.disabled' }}>{fmtDateTime(value as string)}</Typography>,
    },
    { field: 'DATAFIN', headerName: 'Finalizada em', width: 125,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11.5, fontFamily: 'monospace', color: value ? 'success.main' : 'text.disabled' }}>{fmtDateTime(value as string)}</Typography>,
    },
    { field: 'PREVISAO', headerName: 'Previsao', width: 125,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11.5, fontFamily: 'monospace', color: 'text.secondary' }}>{fmtDateTime(value as string)}</Typography>,
    },
    { field: 'KM', headerName: 'KM', width: 75, align: 'right', headerAlign: 'right', type: 'number',
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11.5, fontFamily: 'monospace', color: 'text.secondary' }}>{value && value > 1 ? Number(value).toLocaleString('pt-BR') : '-'}</Typography>,
    },
    { field: 'HORIMETRO', headerName: 'Horimetro', width: 80, align: 'right', headerAlign: 'right', type: 'number',
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11.5, fontFamily: 'monospace', color: 'text.secondary' }}>{value && value > 0 ? Number(value).toLocaleString('pt-BR') : '-'}</Typography>,
    },
    { field: 'AD_FINALIZACAO', headerName: 'Liberacao', width: 120, type: 'singleSelect',
      valueOptions: [{ value: 'LF', label: 'Funcionando' }, { value: 'LT', label: 'Com Restricao' }, { value: 'LD', label: 'Com Defeito' }],
      renderCell: ({ row }) => {
        if (!row.AD_FINALIZACAO) return <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>-</Typography>;
        const color = row.AD_FINALIZACAO === 'LF' ? 'success' : row.AD_FINALIZACAO === 'LT' ? 'warning' : 'error';
        return <Chip label={row.finalizacaoLabel ?? row.AD_FINALIZACAO} size="small" color={color} variant="outlined" sx={{ fontSize: 10, height: 22, fontWeight: 600 }} />;
      },
    },
    { field: 'DESCRICAOPLANO', headerName: 'Plano', width: 150,
      renderCell: ({ value }) => <Typography noWrap sx={{ fontSize: 11, color: 'text.secondary' }}>{value ?? '-'}</Typography>,
    },
    { field: 'NOMEUSUINC', headerName: 'Aberto por', width: 120,
      renderCell: ({ value }) => <Typography noWrap sx={{ fontSize: 11, color: 'text.secondary' }}>{value ?? '-'}</Typography>,
    },
    { field: 'NOMEUSUFIN', headerName: 'Finalizado por', width: 120,
      renderCell: ({ value }) => <Typography noWrap sx={{ fontSize: 11, color: 'text.secondary' }}>{value ?? '-'}</Typography>,
    },
    { field: 'NOMEUSUALTER', headerName: 'Alterado por', width: 120,
      renderCell: ({ value }) => <Typography noWrap sx={{ fontSize: 11, color: 'text.secondary' }}>{value ?? '-'}</Typography>,
    },
    { field: 'DESCRCENCUS', headerName: 'Centro Custo', width: 140,
      renderCell: ({ value }) => <Typography noWrap sx={{ fontSize: 11, color: 'text.secondary' }}>{value ?? '-'}</Typography>,
    },
    { field: 'DESCRNAT', headerName: 'Natureza', width: 130,
      renderCell: ({ value }) => <Typography noWrap sx={{ fontSize: 11, color: 'text.secondary' }}>{value ?? '-'}</Typography>,
    },
    { field: 'NOMEPROJETO', headerName: 'Projeto', width: 130,
      renderCell: ({ value }) => <Typography noWrap sx={{ fontSize: 11, color: 'text.secondary' }}>{value ?? '-'}</Typography>,
    },
    { field: 'DHALTER', headerName: 'Ult. Alteracao', width: 125,
      renderCell: ({ value }) => <Typography sx={{ fontSize: 11.5, fontFamily: 'monospace', color: 'text.secondary' }}>{fmtDateTime(value as string)}</Typography>,
    },
    { field: '_actions', headerName: '', width: 48, sortable: false, filterable: false, disableExport: true, disableColumnMenu: true, disableReorder: true, resizable: false,
      renderCell: ({ row }) => <ActionsMenu row={row} navigate={navigate} onAction={handleQuickAction} />,
    },
  ], [navigate]);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <DataGrid
        rows={ordens}
        columns={columns}
        getRowId={(row) => row.NUOS}
        loading={isLoading}
        rowHeight={52}
        disableRowSelectionOnClick
        showToolbar
        slots={{ toolbar: OsGridToolbar }}
        slotProps={{ toolbar: { tab, onTabChange, onNewOs, filters, onSetFilter, showKpis, onToggleKpis } }}
        onRowClick={({ row }) => navigate(`/ordens-de-servico/${row.NUOS}`)}
        paginationMode="server"
        rowCount={total}
        paginationModel={{ page: Math.max(0, page - 1), pageSize: limit }}
        onPaginationModelChange={(model) => {
          if (model.pageSize !== limit) onPageSizeChange(model.pageSize);
          if (model.page + 1 !== page) onPageChange(model.page + 1);
        }}
        pageSizeOptions={[10, 25, 50, 100, 200]}
        localeText={LOCALE}
        initialState={{
          columns: {
            columnVisibilityModel: {
              NOMEPARC: false,
              NOMEEMPRESA: false,
              CUSTO_TOTAL: false,
              DATAINI: false,
              PREVISAO: false,
              KM: false,
              HORIMETRO: false,
              AD_FINALIZACAO: false,
              DESCRICAOPLANO: false,
              NOMEUSUINC: false,
              NOMEUSUFIN: false,
              NOMEUSUALTER: false,
              DESCRCENCUS: false,
              DESCRNAT: false,
              NOMEPROJETO: false,
              DHALTER: false,
            },
          },
        }}
        sx={gridSx}
      />
      <Popover open={!!confirmAnchor} anchorEl={confirmAnchor?.el} onClose={() => setConfirmAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Box sx={{ p: 2, maxWidth: 220 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>
            {confirmAnchor?.action === 'start' ? 'Iniciar execucao?' :
             confirmAnchor?.action === 'finalize' ? 'Finalizar OS?' :
             confirmAnchor?.action === 'cancel' ? 'Cancelar OS?' :
             confirmAnchor?.action === 'reopen' ? 'Reabrir OS?' : 'Confirmar?'}
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 1.5 }}>OS #{confirmAnchor?.nuos}</Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={() => setConfirmAnchor(null)}>Cancelar</Button>
            <Button size="small" variant="contained"
              color={confirmAnchor?.action === 'cancel' ? 'error' : confirmAnchor?.action === 'start' ? 'info' : confirmAnchor?.action === 'reopen' ? 'warning' : 'success'}
              onClick={executeAction}>Confirmar</Button>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
}
