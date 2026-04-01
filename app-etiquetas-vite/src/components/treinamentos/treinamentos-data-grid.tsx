import { useMemo, useState, useCallback } from 'react';
import {
  DataGrid,
  type GridColDef,
  type GridSortModel,
  type GridRowSelectionModel,
  type GridFilterModel,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Visibility, OpenInNew } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import {
  TreinamentosGridToolbar,
  type TreinamentosGridToolbarProps,
} from './treinamentos-grid-toolbar';
import type { ColaboradorListItem, OpcaoFiltro } from '@/types/treinamento-types';

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
  noRowsLabel: 'Nenhum colaborador encontrado',
  noResultsOverlayLabel: 'Nenhum resultado encontrado',
  MuiTablePagination: {
    labelRowsPerPage: 'Linhas por pagina:',
    labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
      `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`,
  },
};

interface TreinamentosDataGridProps {
  rows: ColaboradorListItem[];
  isLoading: boolean;
  sortModel: GridSortModel;
  selectionModel: GridRowSelectionModel;
  onSortModelChange: (model: GridSortModel) => void;
  onSelectionChange: (model: GridRowSelectionModel) => void;
  onPreview: (row: ColaboradorListItem) => void;
  onRefresh: () => void;
  /* filters */
  departamento: string;
  departamentos: OpcaoFiltro[];
  onDepartamentoChange: (value: OpcaoFiltro | null) => void;
  situacao: string;
  onSituacaoChange: (value: string) => void;
  termo: string;
  onTermoChange: (value: string) => void;
  /* print */
  selectedCount: number;
  totalCount: number;
  printCols: number;
  printing: boolean;
  onPrintSelected: () => void;
  onPrintAll: () => void;
  onPrintColsChange: (cols: number) => void;
}

function getTreinamentoRowId(row: ColaboradorListItem) {
  return `${row.CODEMP}-${row.CODFUNC}`;
}

export function TreinamentosDataGrid({
  rows, isLoading,
  sortModel, selectionModel,
  onSortModelChange, onSelectionChange,
  onPreview, onRefresh,
  departamento, departamentos, onDepartamentoChange,
  situacao, onSituacaoChange,
  termo, onTermoChange,
  selectedCount, totalCount, printCols, printing,
  onPrintSelected, onPrintAll, onPrintColsChange,
}: TreinamentosDataGridProps) {
  const baseUrl = (import.meta.env.VITE_PUBLIC_URL as string) || window.location.origin || 'https://publico.gigantao.net';
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

  const columns: GridColDef<ColaboradorListItem>[] = useMemo(() => [
    {
        field: 'NOMEFUNC',
        headerName: 'Nome',
        flex: 1,
        minWidth: 250,
        renderCell: ({ row }) => {
          const subLine = [row.DESCRCARGO, row.RAZAOSOCIAL].filter(Boolean).join(' · ');
          return (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.5 }}>
              <FuncionarioAvatar
                codparc={row.CODPARC}
                codemp={row.CODEMP}
                codfunc={row.CODFUNC}
                nome={row.NOMEFUNC}
                size="small"
              />
              <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
                <Typography sx={{
                  fontSize: 12.5, fontWeight: 600, lineHeight: 1.3,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {row.NOMEFUNC || '-'}
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
        },
      },
      {
        field: 'actions',
        headerName: '',
        width: 80,
        sortable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.25}>
            <IconButton size="small" onClick={() => onPreview(row)}>
              <Visibility sx={{ fontSize: 18, color: '#94a3b8' }} />
            </IconButton>
            <IconButton
              size="small"
              component="a"
              href={`${baseUrl}/p/treinamento/${row.CODFUNC}`}
              target="_blank"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <OpenInNew sx={{ fontSize: 16, color: '#94a3b8' }} />
            </IconButton>
          </Stack>
        ),
      },
  ], [onPreview]);

  const toolbarProps = useMemo<TreinamentosGridToolbarProps>(() => ({
    onRefresh,
    departamento, departamentos, onDepartamentoChange,
    situacao, onSituacaoChange,
    termo, onTermoChange,
    selectedCount, totalCount,
    printCols, printing,
    onPrintSelected, onPrintAll, onPrintColsChange,
  }), [
    onRefresh,
    departamento, departamentos, onDepartamentoChange,
    situacao, onSituacaoChange,
    termo, onTermoChange,
    selectedCount, totalCount, printCols, printing,
    onPrintSelected, onPrintAll, onPrintColsChange,
  ]);

  const handleFilterChange = useCallback((m: GridFilterModel) => setFilterModel(m), []);

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 120px)' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={getTreinamentoRowId}
        loading={isLoading}
        rowCount={totalCount}
        paginationMode="client"
        sortingMode="client"
        filterMode="client"
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
        slots={{ toolbar: TreinamentosGridToolbar as never }}
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
