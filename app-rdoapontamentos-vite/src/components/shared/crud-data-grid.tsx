import { useState, useRef, useCallback, useMemo, type ReactNode } from 'react';
import { styled } from '@mui/material/styles';
import {
  DataGrid,
  Toolbar,
  ToolbarButton,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  ExportCsv,
  ExportPrint,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  QuickFilterTrigger,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
  type GridRowSelectionModel,
  type GridFilterModel,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';

/* ── locale pt-BR ── */
const LOCALE_PT_BR = {
  ...ptBR.components.MuiDataGrid.defaultProps.localeText,
  toolbarColumns: 'Colunas',
  toolbarFilters: 'Filtros',
  toolbarFiltersTooltipHide: 'Ocultar filtros',
  toolbarFiltersTooltipShow: 'Mostrar filtros',
  toolbarFiltersTooltipActive: (count: number) => `${count} filtro(s) ativo(s)`,
  toolbarDensity: 'Densidade',
  toolbarDensityCompact: 'Compacto',
  toolbarDensityStandard: 'Padrao',
  toolbarDensityComfortable: 'Confortavel',
  toolbarExport: 'Exportar',
  toolbarExportCSV: 'Baixar CSV',
  toolbarExportPrint: 'Imprimir',
  toolbarQuickFilterPlaceholder: 'Buscar...',
  toolbarQuickFilterDeleteIconLabel: 'Limpar',
  filterPanelAddFilter: 'Adicionar filtro',
  filterPanelRemoveAll: 'Remover todos',
  filterPanelOperatorAnd: 'E',
  filterPanelOperatorOr: 'Ou',
  filterPanelColumns: 'Coluna',
  filterPanelInputLabel: 'Valor',
  filterPanelInputPlaceholder: 'Valor do filtro',
  filterOperatorContains: 'contem',
  filterOperatorEquals: 'igual a',
  filterOperatorStartsWith: 'comeca com',
  filterOperatorEndsWith: 'termina com',
  filterOperatorIsEmpty: 'esta vazio',
  filterOperatorIsNotEmpty: 'nao esta vazio',
  filterOperatorIsAnyOf: 'e qualquer um de',
  columnMenuShowColumns: 'Mostrar colunas',
  columnMenuManageColumns: 'Gerenciar colunas',
  columnMenuFilter: 'Filtrar',
  columnMenuHideColumn: 'Ocultar coluna',
  columnMenuUnsort: 'Remover ordenacao',
  columnMenuSortAsc: 'Ordenar crescente',
  columnMenuSortDesc: 'Ordenar decrescente',
  footerRowSelected: (count: number) => `${count} linha(s) selecionada(s)`,
  noRowsLabel: 'Nenhum registro encontrado',
  noResultsOverlayLabel: 'Nenhum resultado encontrado',
  booleanCellTrueLabel: 'Sim',
  booleanCellFalseLabel: 'Nao',
  MuiTablePagination: {
    labelRowsPerPage: 'Linhas por pagina:',
    labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
      `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`,
  },
};

/* ── animated QuickFilter (official MUI v8 pattern) ── */
type OwnerState = { expanded: boolean };

const StyledQuickFilter = styled(QuickFilter)({
  display: 'grid',
  alignItems: 'center',
});

const StyledSearchTrigger = styled(ToolbarButton)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: '1 / 1',
    width: 'min-content',
    height: 'min-content',
    zIndex: 1,
    opacity: ownerState.expanded ? 0 : 1,
    pointerEvents: ownerState.expanded ? 'none' : 'auto',
    transition: theme.transitions.create(['opacity']),
  }),
);

const StyledSearchField = styled(TextField)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: '1 / 1',
    overflowX: 'clip',
    width: ownerState.expanded ? 260 : 'var(--trigger-width)',
    opacity: ownerState.expanded ? 1 : 0,
    transition: theme.transitions.create(['width', 'opacity']),
  }),
);

/* ── toolbar props ── */
interface CrudToolbarProps {
  title?: string;
  onAdd?: () => void;
  onRefresh?: () => void;
  extraActions?: ReactNode;
  extraFilters?: ReactNode;
}

/*
 * Toolbar layout (follows official MUI X v8 GridToolbar.tsx pattern):
 *
 *  [Title]  [+Add]  [extraActions]  [extraFilters]  <spacer>
 *  [Columns] [Filters] | [Export▾] [Refresh] | [🔍 Search]
 */
function CrudGridToolbar(props: CrudToolbarProps) {
  const { title, onAdd, onRefresh, extraActions, extraFilters } = props;

  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportRef = useRef<HTMLButtonElement>(null);

  return (
    <Toolbar>
      {/* Title */}
      {title && (
        <Typography fontWeight="medium" sx={{ mx: 0.5 }}>
          {title}
        </Typography>
      )}

      {/* Extra actions from consumer */}
      {extraActions}

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Extra filters from consumer (e.g. ToggleButtons) — right side */}
      {extraFilters}

      {/* Add — green icon, right side */}
      {onAdd && (
        <Tooltip title="Adicionar">
          <ToolbarButton onClick={onAdd}>
            <AddIcon fontSize="small" sx={{ color: 'success.main' }} />
          </ToolbarButton>
        </Tooltip>
      )}

      {/* Columns */}
      <Tooltip title="Colunas">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>

      {/* Filters */}
      <Tooltip title="Filtros">
        <FilterPanelTrigger
          render={(filterProps, state) => (
            <ToolbarButton {...filterProps} color="default">
              <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                <FilterListIcon fontSize="small" />
              </Badge>
            </ToolbarButton>
          )}
        />
      </Tooltip>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      {/* Export dropdown */}
      <Tooltip title="Exportar">
        <ToolbarButton
          ref={exportRef}
          id="crud-export-trigger"
          aria-controls="crud-export-menu"
          aria-haspopup="true"
          aria-expanded={exportMenuOpen ? 'true' : undefined}
          onClick={() => setExportMenuOpen(true)}
        >
          <FileDownloadIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>
      <Menu
        id="crud-export-menu"
        anchorEl={exportRef.current}
        open={exportMenuOpen}
        onClose={() => setExportMenuOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ list: { 'aria-labelledby': 'crud-export-trigger' } }}
      >
        <ExportPrint render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>
          Imprimir
        </ExportPrint>
        <ExportCsv render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>
          Baixar CSV
        </ExportCsv>
      </Menu>

      {/* Refresh */}
      {onRefresh && (
        <Tooltip title="Atualizar">
          <ToolbarButton onClick={onRefresh}>
            <RefreshIcon fontSize="small" />
          </ToolbarButton>
        </Tooltip>
      )}

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      {/* Animated Quick Filter (official pattern) */}
      <StyledQuickFilter>
        <QuickFilterTrigger
          render={(triggerProps, state) => (
            <Tooltip title="Buscar" enterDelay={0}>
              <StyledSearchTrigger
                {...triggerProps}
                ownerState={{ expanded: state.expanded }}
                color="default"
                aria-disabled={state.expanded}
              >
                <SearchIcon fontSize="small" />
              </StyledSearchTrigger>
            </Tooltip>
          )}
        />
        <QuickFilterControl
          render={({ ref, ...controlProps }, state) => (
            <StyledSearchField
              {...controlProps}
              ownerState={{ expanded: state.expanded }}
              inputRef={ref}
              aria-label="Buscar"
              placeholder="Buscar..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: state.value ? (
                    <InputAdornment position="end">
                      <QuickFilterClear
                        edge="end"
                        size="small"
                        aria-label="Limpar busca"
                        material={{ sx: { marginRight: -0.75 } }}
                      >
                        <CancelIcon fontSize="small" />
                      </QuickFilterClear>
                    </InputAdornment>
                  ) : null,
                  ...controlProps.slotProps?.input,
                },
                ...controlProps.slotProps,
              }}
            />
          )}
        />
      </StyledQuickFilter>
    </Toolbar>
  );
}

/* ── CrudDataGrid props ── */
export interface CrudDataGridProps<T> {
  rows: T[];
  columns: GridColDef[];
  loading: boolean;
  getRowId: (row: T) => string | number;
  /* pagination */
  rowCount?: number;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  paginationMode?: 'server' | 'client';
  pageSizeOptions?: number[];
  /* sorting */
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  sortingMode?: 'server' | 'client';
  /* filtering */
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;
  filterMode?: 'server' | 'client';
  /* selection */
  selectedRows?: GridRowSelectionModel;
  onSelectionChange?: (selection: GridRowSelectionModel) => void;
  checkboxSelection?: boolean;
  /* row events */
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  /* toolbar */
  title?: string;
  onAdd?: () => void;
  onRefresh?: () => void;
  extraActions?: ReactNode;
  extraFilters?: ReactNode;
  /* display */
  density?: 'compact' | 'standard' | 'comfortable';
  rowHeight?: number;
  height?: number | string;
  noRowsMessage?: string;
  getRowClassName?: (params: { row: T }) => string;
  initialState?: Record<string, unknown>;
  /* master-detail */
  getDetailPanelContent?: (params: { row: T }) => ReactNode;
  getDetailPanelHeight?: (params: { row: T }) => number | 'auto';
}

/* ── CrudDataGrid component ── */
export function CrudDataGrid<T>(props: CrudDataGridProps<T>) {
  const {
    rows, columns, loading, getRowId,
    rowCount, paginationModel, onPaginationModelChange,
    paginationMode = 'server', pageSizeOptions = [10, 25, 50, 100],
    sortModel, onSortModelChange, sortingMode = 'server',
    filterModel: filterModelProp, onFilterModelChange: onFilterChangeProp,
    filterMode = 'client',
    selectedRows, onSelectionChange, checkboxSelection = false,
    onRowClick, onRowDoubleClick,
    title, onAdd, onRefresh,
    extraActions, extraFilters,
    density = 'compact', rowHeight, height = 'calc(100vh - 200px)',
    noRowsMessage, getRowClassName, initialState,
    getDetailPanelContent, getDetailPanelHeight,
  } = props;

  const [internalFilter, setInternalFilter] = useState<GridFilterModel>({ items: [] });
  const filterModel = filterModelProp ?? internalFilter;
  const onFilterModelChange = useCallback(
    (m: GridFilterModel) => {
      if (onFilterChangeProp) onFilterChangeProp(m);
      else setInternalFilter(m);
    },
    [onFilterChangeProp],
  );

  const toolbarProps = useMemo<CrudToolbarProps>(() => ({
    title, onAdd, onRefresh, extraActions, extraFilters,
  }), [title, onAdd, onRefresh, extraActions, extraFilters]);

  return (
    <Box sx={{ width: '100%', height }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={getRowId}
        /* pagination */
        rowCount={rowCount}
        paginationMode={paginationMode}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={pageSizeOptions}
        /* sorting */
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        sortingMode={sortingMode}
        /* filtering */
        filterModel={filterModel}
        onFilterModelChange={onFilterModelChange}
        filterMode={filterMode}
        /* selection */
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={onSelectionChange}
        checkboxSelection={checkboxSelection}
        /* row events */
        onRowClick={onRowClick ? (p) => onRowClick(p.row as T) : undefined}
        onRowDoubleClick={onRowDoubleClick ? (p) => onRowDoubleClick(p.row as T) : undefined}
        /* toolbar */
        showToolbar
        slots={{ toolbar: CrudGridToolbar as never }}
        slotProps={{ toolbar: toolbarProps as never }}
        /* master-detail */
        {...(getDetailPanelContent ? {
          getDetailPanelContent: (p: { row: unknown }) => getDetailPanelContent({ row: p.row as T }),
          getDetailPanelHeight: getDetailPanelHeight
            ? (p: { row: unknown }) => getDetailPanelHeight({ row: p.row as T })
            : () => 'auto' as const,
        } : {})}
        /* display */
        density={density}
        {...(rowHeight ? { rowHeight } : {})}
        disableRowSelectionOnClick
        disableColumnMenu={false}
        localeText={{ ...LOCALE_PT_BR, noRowsLabel: noRowsMessage ?? LOCALE_PT_BR.noRowsLabel }}
        getRowClassName={getRowClassName as never}
        initialState={initialState as never}
        sx={{
          border: 1, borderColor: 'divider', borderRadius: 2,
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(46,125,50,0.04)',
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12.5 },
          },
          '& .MuiDataGrid-row': {
            cursor: onRowClick ? 'pointer' : 'default',
            transition: 'background-color 0.15s',
            '&:nth-of-type(even)': {
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)',
            },
            '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.07)' },
            '&.Mui-selected': {
              bgcolor: 'rgba(46, 125, 50, 0.12)',
              '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.16)' },
            },
          },
          '& .MuiDataGrid-cell': {
            fontSize: 13, borderColor: 'divider', overflow: 'hidden',
            ...(rowHeight && rowHeight >= 56 ? { py: '6px' } : {}),
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': { outline: 'none' },
          '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 1, borderColor: 'divider', minHeight: 44,
            overflow: 'hidden',
          },
          '& .MuiDataGrid-scrollbar--horizontal': { display: 'none' },
          '& .row-produtivo': { bgcolor: 'rgba(46, 125, 50, 0.03)' },
          '& .row-improdutivo': { bgcolor: 'rgba(237, 108, 2, 0.03)' },
          '& .row-inativo': { opacity: 0.5, fontStyle: 'italic' },
        }}
      />
    </Box>
  );
}
