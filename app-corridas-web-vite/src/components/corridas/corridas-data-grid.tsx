import { useState, useRef, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import {
  DataGrid,
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv, ExportPrint,
  QuickFilter, QuickFilterControl, QuickFilterTrigger,
} from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel, GridFilterModel, GridSortModel } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import {
  Badge, Box, Divider, ListItemText, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, MenuItem, Tooltip, Typography, IconButton, ToggleButton,
  ToggleButtonGroup, Select, FormControl, InputLabel, Button,
} from '@mui/material';
import {
  ViewColumn, FilterList, FileDownload, Refresh, Search, Add,
  FilterAltOff, TuneRounded, CheckCircle, Edit,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, differenceInMinutes, parseISO } from 'date-fns';
import type { Corrida } from '@/types/corrida';
import { STATUS_LABELS, STATUS_COLORS, BUSCAR_LEVAR_LABELS } from '@/types/corrida';
import { useMotoristas } from '@/hooks/use-corridas';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

const LOCALE = {
  ...ptBR.components.MuiDataGrid.defaultProps.localeText,
  noRowsLabel: 'Nenhuma corrida encontrada',
  noResultsOverlayLabel: 'Nenhum resultado',
  MuiTablePagination: {
    labelRowsPerPage: 'Por pagina:',
    labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
      `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`,
  },
};

type OwnerState = { expanded: boolean };
const StyledQuickFilter = styled(QuickFilter)({ display: 'grid', alignItems: 'center' });
const StyledSearchTrigger = styled(ToolbarButton)<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({
  gridArea: '1 / 1', width: 'min-content', height: 'min-content', zIndex: 1,
  opacity: ownerState.expanded ? 0 : 1, pointerEvents: ownerState.expanded ? 'none' : 'auto',
  transition: theme.transitions.create(['opacity']),
}));
const StyledSearchField = styled('input')<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({
  gridArea: '1 / 1', overflowX: 'clip' as const,
  width: ownerState.expanded ? 220 : 'var(--trigger-width)',
  opacity: ownerState.expanded ? 1 : 0,
  transition: theme.transitions.create(['width', 'opacity']),
  border: '1px solid', borderColor: theme.palette.divider, borderRadius: theme.shape.borderRadius,
  padding: '4px 8px', fontSize: 13, outline: 'none', backgroundColor: 'transparent', color: 'inherit',
  '&:focus': { borderColor: theme.palette.primary.main },
}));

interface CorridasDataGridProps {
  rows: Corrida[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick: (id: number) => void;
  statusFilter?: string;
  onStatusFilter?: (s: string) => void;
  sortField: string;
  sortDir: 'ASC' | 'DESC';
  onSortChange: (field: string, dir: 'ASC' | 'DESC') => void;
  dataInicio: string;
  dataFim: string;
  onDataInicioChange: (v: string) => void;
  onDataFimChange: (v: string) => void;
  motorista: string;
  onMotoristaChange: (v: string) => void;
  buscarLevar: string;
  onBuscarLevarChange: (v: string) => void;
  activeFilterCount: number;
  onClearFilters: () => void;
  onRefresh?: () => void;
  onAdd?: () => void;
  onConcluir?: (id: number) => void;
  onEditRow?: (id: number) => void;
}

function fmtDate(val: string | null) {
  if (!val) return '-';
  try { return format(parseISO(val), 'dd/MM HH:mm'); } catch { return val; }
}

function calcTempo(row: Corrida): string {
  if (!row.DT_FINISHED || !row.DT_CREATED) return '-';
  try {
    const m = differenceInMinutes(parseISO(row.DT_FINISHED), parseISO(row.DT_CREATED));
    if (m < 0) return '-';
    return m < 60 ? `${m}min` : `${Math.floor(m / 60)}h${m % 60 > 0 ? `${m % 60}m` : ''}`;
  } catch { return '-'; }
}

function buildColumns(onConcluir?: (id: number) => void, onEditRow?: (id: number) => void): GridColDef<Corrida>[] {
  return [
  { field: 'ID', headerName: 'ID', width: 64, type: 'number' },
  {
    field: 'STATUS', headerName: 'Status', width: 100,
    renderCell: ({ row }) => (
      <Box sx={{ py: 0.5 }}>
        <Typography variant="caption" fontWeight={700} display="block"
          sx={{ color: STATUS_COLORS[row.STATUS] ?? '#888', lineHeight: 1.4 }}>
          {STATUS_LABELS[row.STATUS] ?? row.STATUS}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block"
          sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
          {BUSCAR_LEVAR_LABELS[row.BUSCARLEVAR] ?? row.BUSCARLEVAR}
        </Typography>
      </Box>
    ),
  },
  {
    field: 'NOMEPARC', headerName: 'Parceiro / Destino', flex: 1, minWidth: 240,
    renderCell: ({ row }) => {
      const parts = [row.RUA_PARCEIRO, row.NUMEND_PARCEIRO, row.BAIRRO_PARCEIRO].filter(Boolean);
      const cidUf = [row.CIDADE_PARCEIRO, row.UF_PARCEIRO].filter(Boolean).join('/');
      return (
        <Box sx={{ minWidth: 0, py: 0.5 }}>
          <Typography variant="caption" fontWeight={600} noWrap display="block" sx={{ lineHeight: 1.3 }}>
            {row.NOMEPARC ?? row.DESTINO ?? '-'}
          </Typography>
          {parts.length > 0 && (
            <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: '0.68rem', lineHeight: 1.2 }}>
              {parts.join(', ')}{cidUf ? ` - ${cidUf}` : ''}
            </Typography>
          )}
          {row.TELEFONE_PARCEIRO && (
            <Typography variant="caption" color="text.disabled" noWrap display="block" sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
              {row.TELEFONE_PARCEIRO}
            </Typography>
          )}
        </Box>
      );
    },
  },
  {
    field: 'NOMESOLICITANTE', headerName: 'Solicitante', width: 180,
    renderCell: ({ row }) => (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
        <FuncionarioAvatar codparc={row.CODPARC_SOLICITANTE} nome={row.NOMESOLICITANTE} size="small" />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" fontWeight={600} noWrap display="block" sx={{ lineHeight: 1.3 }}>
            {row.NOMESOLICITANTE}
          </Typography>
          {(row.CARGO_SOLICITANTE || row.SETOR) && (
            <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
              {[row.CARGO_SOLICITANTE, row.SETOR].filter(Boolean).join(' · ')}
            </Typography>
          )}
        </Box>
      </Stack>
    ),
  },
  {
    field: 'NOMEMOTORISTA', headerName: 'Motorista', width: 180,
    renderCell: ({ row }) => row.NOMEMOTORISTA ? (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
        <FuncionarioAvatar codparc={row.CODPARC_MOTORISTA} nome={row.NOMEMOTORISTA} size="small" />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" fontWeight={600} noWrap display="block" sx={{ lineHeight: 1.3 }}>
            {row.NOMEMOTORISTA}
          </Typography>
          {row.CARGO_MOTORISTA && (
            <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
              {row.CARGO_MOTORISTA}
            </Typography>
          )}
        </Box>
      </Stack>
    ) : (
      <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>Sem motorista</Typography>
    ),
  },
  {
    field: 'PASSAGEIROSMERCADORIA', headerName: 'Mercadoria', width: 180,
    renderCell: ({ row }) => (
      <Box sx={{ minWidth: 0, py: 0.5 }}>
        <Typography variant="caption" noWrap display="block" sx={{ lineHeight: 1.3 }}>
          {row.PASSAGEIROSMERCADORIA ?? '-'}
        </Typography>
        {row.OBS && (
          <Typography variant="caption" color="text.disabled" noWrap display="block" sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
            {row.OBS}
          </Typography>
        )}
      </Box>
    ),
  },
  {
    field: 'DT_ACIONAMENTO', headerName: 'Acionamento', width: 105,
    renderCell: ({ value }) => <Typography variant="caption" sx={{ fontSize: '0.72rem' }}>{fmtDate(value as string | null)}</Typography>,
  },
  {
    field: 'DT_CREATED', headerName: 'Criado', width: 105,
    renderCell: ({ value }) => <Typography variant="caption" sx={{ fontSize: '0.72rem' }}>{fmtDate(value as string | null)}</Typography>,
  },
  {
    field: 'tempo', headerName: 'Tempo', width: 70, sortable: false,
    renderCell: ({ row }) => {
      const t = calcTempo(row);
      return <Typography variant="caption" fontWeight={t !== '-' ? 700 : 400} sx={{ color: t !== '-' ? '#2e7d32' : 'text.disabled' }}>{t}</Typography>;
    },
  },
  {
    field: 'actions', headerName: '', width: 90, sortable: false, disableColumnMenu: true,
    renderCell: ({ row }) => (
      <Stack direction="row" spacing={0.5} alignItems="center">
        {(row.STATUS === '0' || row.STATUS === '1') && onConcluir && (
          <Tooltip title="Concluir">
            <IconButton
              size="small"
              sx={{ color: 'success.main' }}
              onClick={(e) => { e.stopPropagation(); onConcluir(row.ID); }}
            >
              <CheckCircle fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {onEditRow && (
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEditRow(row.ID); }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    ),
  },
];
}

const STATUS_TOGGLE_SX = {
  '& .MuiToggleButton-root': {
    textTransform: 'none' as const, fontSize: 11, fontWeight: 600,
    px: 1.25, py: 0.3, lineHeight: 1.5,
  },
};

function CorridasGridToolbar(props: {
  statusFilter?: string; onStatusFilter?: (s: string) => void;
  dataInicio?: string; dataFim?: string;
  onDataInicioChange?: (v: string) => void; onDataFimChange?: (v: string) => void;
  motorista?: string; onMotoristaChange?: (v: string) => void;
  buscarLevar?: string; onBuscarLevarChange?: (v: string) => void;
  activeFilterCount?: number; onClearFilters?: () => void;
  onRefresh?: () => void; onAdd?: () => void;
}) {
  const {
    statusFilter, onStatusFilter,
    dataInicio, dataFim, onDataInicioChange, onDataFimChange,
    motorista, onMotoristaChange,
    buscarLevar, onBuscarLevarChange,
    activeFilterCount = 0, onClearFilters,
    onRefresh, onAdd,
  } = props;
  const [exportOpen, setExportOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const exportRef = useRef<HTMLButtonElement>(null);
  const { data: motoristas } = useMotoristas();

  const advancedCount = [dataInicio, dataFim, motorista, buscarLevar].filter(Boolean).length;

  return (
    <>
      <Toolbar>
        {/* ESQUERDA: Status toggles */}
        {onStatusFilter && (
          <ToggleButtonGroup
            value={statusFilter ?? ''} exclusive
            onChange={(_, v) => { if (v !== null) onStatusFilter(v); }}
            size="small" sx={STATUS_TOGGLE_SX}
          >
            <ToggleButton value="">Todos</ToggleButton>
            <ToggleButton value="0" sx={{ '&.Mui-selected': { bgcolor: `${STATUS_COLORS['0']}14`, color: STATUS_COLORS['0'] } }}>Aberto</ToggleButton>
            <ToggleButton value="1" sx={{ '&.Mui-selected': { bgcolor: `${STATUS_COLORS['1']}14`, color: STATUS_COLORS['1'] } }}>Andamento</ToggleButton>
            <ToggleButton value="2" sx={{ '&.Mui-selected': { bgcolor: `${STATUS_COLORS['2']}14`, color: STATUS_COLORS['2'] } }}>Concluido</ToggleButton>
            <ToggleButton value="3" sx={{ '&.Mui-selected': { bgcolor: `${STATUS_COLORS['3']}14`, color: STATUS_COLORS['3'] } }}>Cancelado</ToggleButton>
          </ToggleButtonGroup>
        )}

        <Box sx={{ flex: 1 }} />

        {/* CENTRO-DIREITA: Ferramentas */}
        <StyledQuickFilter>
          <QuickFilterTrigger render={(triggerProps, state) => (
            <Tooltip title="Buscar" enterDelay={0}>
              <StyledSearchTrigger {...triggerProps} ownerState={{ expanded: state.expanded }} color="default" aria-disabled={state.expanded}>
                <Search fontSize="small" />
              </StyledSearchTrigger>
            </Tooltip>
          )} />
          <QuickFilterControl render={({ ref, ...cp }, state) => {
            const { value, onChange, onKeyDown } = cp as any;
            return <StyledSearchField ref={ref as any} value={value ?? ''} onChange={onChange} onKeyDown={onKeyDown}
              ownerState={{ expanded: state.expanded }} aria-label="Buscar" placeholder="Buscar..." />;
          }} />
        </StyledQuickFilter>

        <Tooltip title="Filtros avancados">
          <ToolbarButton onClick={() => setFilterDialogOpen(true)}>
            <Badge badgeContent={advancedCount} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: 9, minWidth: 14, height: 14 } }}>
              <TuneRounded fontSize="small" />
            </Badge>
          </ToolbarButton>
        </Tooltip>

        {activeFilterCount > 0 && onClearFilters && (
          <Tooltip title="Limpar filtros">
            <ToolbarButton onClick={onClearFilters}>
              <FilterAltOff fontSize="small" />
            </ToolbarButton>
          </Tooltip>
        )}

        <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

        <Tooltip title="Colunas">
          <ColumnsPanelTrigger render={<ToolbarButton />}><ViewColumn fontSize="small" /></ColumnsPanelTrigger>
        </Tooltip>
        <Tooltip title="Filtros grid">
          <FilterPanelTrigger render={(fp, state) => (
            <ToolbarButton {...fp} color="default">
              <Badge badgeContent={state.filterCount} color="primary" variant="dot"><FilterList fontSize="small" /></Badge>
            </ToolbarButton>
          )} />
        </Tooltip>
        <Tooltip title="Exportar">
          <ToolbarButton ref={exportRef} onClick={() => setExportOpen(true)}><FileDownload fontSize="small" /></ToolbarButton>
        </Tooltip>
        <Menu anchorEl={exportRef.current} open={exportOpen} onClose={() => setExportOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <ExportPrint render={<MenuItem />} onClick={() => setExportOpen(false)}><ListItemText>Imprimir</ListItemText></ExportPrint>
          <ExportCsv render={<MenuItem />} onClick={() => setExportOpen(false)}><ListItemText>Baixar CSV</ListItemText></ExportCsv>
        </Menu>
        {onRefresh && (
          <Tooltip title="Atualizar">
            <ToolbarButton onClick={onRefresh}><Refresh fontSize="small" /></ToolbarButton>
          </Tooltip>
        )}

        {/* DIREITA: Nova corrida */}
        {onAdd && (
          <>
            <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
            <Tooltip title="Nova corrida">
              <Button size="small" variant="contained" startIcon={<Add />} onClick={onAdd}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12, borderRadius: 1.5, px: 1.5, py: 0.4, minHeight: 0 }}>
                Nova
              </Button>
            </Tooltip>
          </>
        )}
      </Toolbar>

      {/* Dialog de filtros avancados */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Filtros Avancados</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Stack direction="row" spacing={2}>
              <DatePicker label="Periodo de" value={dataInicio ? parseISO(dataInicio) : null}
                onChange={(d) => onDataInicioChange?.(d ? format(d, 'yyyy-MM-dd') : '')}
                slotProps={{ textField: { size: 'small', fullWidth: true } }} />
              <DatePicker label="Periodo ate" value={dataFim ? parseISO(dataFim) : null}
                onChange={(d) => onDataFimChange?.(d ? format(d, 'yyyy-MM-dd') : '')}
                slotProps={{ textField: { size: 'small', fullWidth: true } }} />
            </Stack>
            <FormControl size="small" fullWidth>
              <InputLabel>Motorista</InputLabel>
              <Select label="Motorista" value={motorista ?? ''} onChange={(e) => onMotoristaChange?.(e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                {motoristas?.map((m) => (
                  <MenuItem key={m.CODUSU} value={String(m.CODUSU)}>{m.NOMEUSU}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Tipo de corrida</InputLabel>
              <Select label="Tipo de corrida" value={buscarLevar ?? ''} onChange={(e) => onBuscarLevarChange?.(e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                {Object.entries(BUSCAR_LEVAR_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          {advancedCount > 0 && (
            <Button onClick={() => { onDataInicioChange?.(''); onDataFimChange?.(''); onMotoristaChange?.(''); onBuscarLevarChange?.(''); }}
              color="error" size="small">
              Limpar
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setFilterDialogOpen(false)} variant="contained" size="small">Aplicar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function CorridasDataGrid({
  rows, total, loading, page, pageSize,
  onPageChange, onPageSizeChange, onRowClick,
  statusFilter, onStatusFilter,
  sortField, sortDir, onSortChange,
  dataInicio, dataFim, onDataInicioChange, onDataFimChange,
  motorista, onMotoristaChange,
  buscarLevar, onBuscarLevarChange,
  activeFilterCount, onClearFilters,
  onRefresh, onAdd,
  onConcluir, onEditRow,
}: CorridasDataGridProps) {
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const cols = useMemo(() => buildColumns(onConcluir, onEditRow), [onConcluir, onEditRow]);
  const sortModel: GridSortModel = sortField
    ? [{ field: sortField, sort: sortDir.toLowerCase() as 'asc' | 'desc' }]
    : [];

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        rows={rows} columns={cols} getRowId={(row) => row.ID}
        loading={loading} rowCount={total}
        paginationMode="server"
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(m: GridPaginationModel) => {
          if (m.page !== page) onPageChange(m.page);
          if (m.pageSize !== pageSize) onPageSizeChange(m.pageSize);
        }}
        pageSizeOptions={[25, 50, 100]}
        sortingMode="server" sortModel={sortModel}
        onSortModelChange={(m) => {
          if (m.length > 0) onSortChange(m[0].field, m[0].sort === 'asc' ? 'ASC' : 'DESC');
          else onSortChange('ID', 'DESC');
        }}
        filterModel={filterModel} onFilterModelChange={setFilterModel}
        onRowClick={(p) => onRowClick(p.row.ID)}
        disableRowSelectionOnClick
        density="compact" rowHeight={64}
        showToolbar
        slots={{ toolbar: CorridasGridToolbar as any }}
        slotProps={{
          toolbar: {
            statusFilter, onStatusFilter,
            dataInicio, dataFim, onDataInicioChange, onDataFimChange,
            motorista, onMotoristaChange,
            buscarLevar, onBuscarLevarChange,
            activeFilterCount, onClearFilters,
            onRefresh, onAdd,
          } as any,
        }}
        localeText={LOCALE}
        sx={{
          border: 'none', flex: 1,
          '& .MuiDataGrid-row': { cursor: 'pointer' },
          '& .MuiDataGrid-cell': { fontSize: '0.78rem', display: 'flex', alignItems: 'center', overflow: 'hidden' },
          '& .MuiDataGrid-columnHeader': { fontSize: '0.72rem', fontWeight: 700 },
        }}
      />
    </Box>
  );
}
