import { useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { useHstVeiPainel } from '@/hooks/use-hstvei';
import type { PainelVeiculo } from '@/types/hstvei-types';

const columns: GridColDef<PainelVeiculo>[] = [
  {
    field: 'placa',
    headerName: 'Placa',
    width: 120,
    sortable: true,
  },
  {
    field: 'tag',
    headerName: 'Tag',
    width: 120,
  },
  {
    field: 'marcaModelo',
    headerName: 'Marca/Modelo',
    flex: 1,
    minWidth: 180,
  },
  {
    field: 'tipo',
    headerName: 'Tipo',
    width: 120,
  },
  {
    field: 'situacao',
    headerName: 'Situacao',
    width: 180,
    valueGetter: (_value, row) => {
      const sit = row.situacoesAtivas?.[0];
      return sit?.situacao ?? '—';
    },
  },
  {
    field: 'departamento',
    headerName: 'Departamento',
    width: 160,
    valueGetter: (_value, row) => {
      const sit = row.situacoesAtivas?.[0];
      return sit?.departamento ?? '—';
    },
  },
  {
    field: 'prioridadeMaxima',
    headerName: 'Prioridade',
    width: 110,
    valueGetter: (_value, row) => {
      const sit = row.situacoesAtivas?.[0];
      return sit?.prioridadeSigla ?? '—';
    },
  },
  {
    field: 'previsaoMaisProxima',
    headerName: 'Previsao',
    width: 140,
    valueGetter: (_value, row) => {
      if (!row.previsaoMaisProxima) return '—';
      try {
        const d = new Date(row.previsaoMaisProxima.replace(' ', 'T'));
        return d.toLocaleDateString('pt-BR');
      } catch {
        return row.previsaoMaisProxima;
      }
    },
  },
];

export function VeiculosPage() {
  const { data: painel, isLoading } = useHstVeiPainel();

  const rows = useMemo(() => painel?.veiculos ?? [], [painel]);

  if (isLoading) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.codveiculo}
        density="compact"
        disableRowSelectionOnClick
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        initialState={{
          sorting: { sortModel: [{ field: 'placa', sort: 'asc' }] },
        }}
        sx={{
          flex: 1,
          border: 'none',
          '& .MuiDataGrid-cell': { fontSize: 13 },
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 13 },
        }}
      />
    </Box>
  );
}
