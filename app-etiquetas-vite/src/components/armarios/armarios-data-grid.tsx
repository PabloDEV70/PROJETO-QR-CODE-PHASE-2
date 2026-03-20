import { useMemo, useState, useCallback } from 'react';
import {
  DataGrid,
  type GridColDef,
  type GridSortModel,
  type GridPaginationModel,
  type GridRowSelectionModel,
  type GridFilterModel,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Visibility, OpenInNew } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import {
  ArmariosGridToolbar,
  type ArmariosGridToolbarProps,
  type LocalOption,
} from './armarios-grid-toolbar';
import type { ArmarioListItem } from '@/types/armario-types';

const LOCALE_PT_BR = {
  ...ptBR.components.MuiDataGrid.defaultProps.localeText,
  toolbarColumns: 'Colunas',
  toolbarFilters: 'Filtros',
  toolbarFiltersTooltipHide: 'Ocultar filtros',
  toolbarFiltersTooltipShow: 'Mostrar filtros',
  toolbarFiltersTooltipActive: (count: number) => `${count} filtro(s) ativo(s)`,
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
  noRowsLabel: 'Nenhum armario encontrado',
  noResultsOverlayLabel: 'Nenhum resultado encontrado',
  MuiTablePagination: {
    labelRowsPerPage: 'Linhas por pagina:',
    labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
      `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`,
  },
};

interface ArmariosDataGridProps {
  rows: ArmarioListItem[];
  rowCount: number;
  isLoading: boolean;
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  selectionModel: GridRowSelectionModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onSortModelChange: (model: GridSortModel) => void;
  onSelectionChange: (model: GridRowSelectionModel) => void;
  onPreview: (row: ArmarioListItem) => void;
  onRefresh: () => void;
  /* filters */
  localArm: string;
  localOptions: LocalOption[];
  onLocalChange: (value: string) => void;
  ocupado: string;
  onOcupadoChange: (value: string) => void;
  departamento: string;
  departamentos: string[];
  onDepartamentoChange: (value: string | null) => void;
  /* print */
  selectedCount: number;
  totalCount: number;
  printCols: number;
  printing: boolean;
  onPrintSelected: () => void;
  onPrintAll: () => void;
  onPrintColsChange: (cols: number) => void;
}

function FuncionarioCell({ row }: { row: ArmarioListItem }) {
  if (!row.ocupado) {
    return <Typography sx={{ fontSize: 12.5, color: '#94a3b8' }}>-</Typography>;
  }
  const subLine = [row.departamento, row.funcao].filter(Boolean).join(' · ');
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.5 }}>
      <FuncionarioAvatar
        codparc={row.codparc || undefined}
        codemp={row.codemp}
        codfunc={row.codfunc}
        nome={row.nomeFuncionario}
        size="small"
      />
      <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
        <Typography sx={{
          fontSize: 12.5, fontWeight: 600, lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {row.nomeFuncionario || '-'}
        </Typography>
        {subLine && (
          <Tooltip title={subLine} arrow placement="bottom-start">
            <Typography sx={{
              fontSize: 11, color: '#94a3b8', lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {subLine}
            </Typography>
          </Tooltip>
        )}
      </Box>
    </Stack>
  );
}

export function ArmariosDataGrid({
  rows, rowCount, isLoading,
  paginationModel, sortModel, selectionModel,
  onPaginationModelChange, onSortModelChange, onSelectionChange,
  onPreview, onRefresh,
  localArm, localOptions, onLocalChange,
  ocupado, onOcupadoChange,
  departamento, departamentos, onDepartamentoChange,
  selectedCount, totalCount, printCols, printing,
  onPrintSelected, onPrintAll, onPrintColsChange,
}: ArmariosDataGridProps) {
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

  const columns: GridColDef<ArmarioListItem>[] = useMemo(() => [
    { field: 'codarmario', headerName: 'Cod', width: 70, align: 'right', headerAlign: 'right' },
    {
      field: 'tagArmario', headerName: 'TAG', width: 120,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{value}</Typography>
      ),
    },
    { field: 'localDescricao', headerName: 'Local', width: 180 },
    { field: 'nuarmario', headerName: 'N', width: 60, align: 'center', headerAlign: 'center' },
    {
      field: 'ocupado', headerName: 'Status', width: 100,
      renderCell: ({ value }) => (
        <Chip
          label={value ? 'Ocupado' : 'Livre'} size="small"
          sx={{
            fontWeight: 600, fontSize: 11,
            bgcolor: value ? 'rgba(46,125,50,0.12)' : 'rgba(148,163,184,0.15)',
            color: value ? '#2e7d32' : '#64748b',
          }}
        />
      ),
    },
    {
      field: 'nomeFuncionario', headerName: 'Funcionario', flex: 1, minWidth: 240,
      renderCell: ({ row }) => <FuncionarioCell row={row} />,
    },
    { field: 'empresa', headerName: 'Empresa', width: 150 },
    { field: 'nucadeado', headerName: 'Cadeado', width: 100 },
    {
      field: 'actions', headerName: '', width: 80, sortable: false, disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.25}>
          <IconButton size="small" onClick={() => onPreview(row)}>
            <Visibility sx={{ fontSize: 18, color: '#94a3b8' }} />
          </IconButton>
          <IconButton
            size="small" component="a"
            href={`https://publico.gigantao.net/p/armario/${row.codarmario}`}
            target="_blank"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <OpenInNew sx={{ fontSize: 16, color: '#94a3b8' }} />
          </IconButton>
        </Stack>
      ),
    },
  ], [onPreview]);

  const toolbarProps = useMemo<ArmariosGridToolbarProps>(() => ({
    onRefresh,
    localArm, localOptions, onLocalChange,
    ocupado, onOcupadoChange,
    departamento, departamentos, onDepartamentoChange,
    selectedCount, totalCount,
    printCols, printing,
    onPrintSelected, onPrintAll, onPrintColsChange,
  }), [
    onRefresh,
    localArm, localOptions, onLocalChange,
    ocupado, onOcupadoChange,
    departamento, departamentos, onDepartamentoChange,
    selectedCount, totalCount, printCols, printing,
    onPrintSelected, onPrintAll, onPrintColsChange,
  ]);

  const handleFilterChange = useCallback((m: GridFilterModel) => setFilterModel(m), []);

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 120px)' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.codarmario}
        loading={isLoading}
        rowCount={rowCount}
        paginationMode="server"
        sortingMode="server"
        filterMode="client"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        filterModel={filterModel}
        onFilterModelChange={handleFilterChange}
        checkboxSelection
        keepNonExistentRowsSelected
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={onSelectionChange}
        pageSizeOptions={[10, 25, 50, 100]}
        rowHeight={52}
        density="compact"
        disableRowSelectionOnClick
        showToolbar
        slots={{ toolbar: ArmariosGridToolbar as never }}
        slotProps={{ toolbar: toolbarProps as never }}
        localeText={LOCALE_PT_BR}
        sx={{
          border: 1, borderColor: 'divider', borderRadius: 2,
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'rgba(46,125,50,0.04)',
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12.5 },
          },
          '& .MuiDataGrid-row': {
            transition: 'background-color 0.15s',
            '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.015)' },
            '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.07)' },
            '&.Mui-selected': {
              bgcolor: 'rgba(46, 125, 50, 0.12)',
              '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.16)' },
            },
          },
          '& .MuiDataGrid-cell': {
            fontSize: 13, borderColor: 'divider', overflow: 'hidden',
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': { outline: 'none' },
          '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 1, borderColor: 'divider', minHeight: 44,
          },
          '& .MuiDataGrid-scrollbar--horizontal': { display: 'none' },
        }}
      />
    </Box>
  );
}
