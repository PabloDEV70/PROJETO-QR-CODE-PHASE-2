import { useMemo } from 'react';
import { Box } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import { getVeiculoStatusInfo } from '@/utils/status-utils';
import { getPrioridadeInfo } from '@/utils/prioridade-constants';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import { PessoaAvatarGroup } from '@/components/painel/pessoa-avatar-group';
import type { PainelVeiculo, PainelPessoa } from '@/types/hstvei-types';

interface GridRow {
  id: number;
  placa: string;
  tag: string;
  tipo: string;
  capacidade: string;
  fabricante: string;
  marcaModelo: string;
  situacao: string;
  statusCategoria: string;
  statusColor: string;
  departamento: string;
  prioridade: string;
  prioridadeSigla: string;
  descricao: string;
  dtinicio: string;
  dtprevisao: string;
  nuos: string;
  totalSituacoes: number;
  equipe: PainelPessoa[];
  criadoPor: PainelPessoa | null;
}

function veiculoToRow(v: PainelVeiculo): GridRow {
  const sit = v.situacoesAtivas[0];
  const statusInfo = getVeiculoStatusInfo(v);
  const prioInfo = getPrioridadeInfo(v.prioridadeMaxima);
  const depInfo = sit ? getDepartamentoInfo(sit.coddep) : null;

  return {
    id: v.codveiculo,
    placa: v.placa ?? '',
    tag: v.tag ?? '',
    tipo: v.tipo ?? '',
    capacidade: v.capacidade ?? '',
    fabricante: v.fabricante ?? '',
    marcaModelo: v.marcaModelo ?? '',
    situacao: sit?.situacao ?? 'Sem situacao',
    statusCategoria: statusInfo.label,
    statusColor: statusInfo.color,
    departamento: depInfo?.label ?? '',
    prioridade: prioInfo.label,
    prioridadeSigla: prioInfo.sigla,
    descricao: sit?.descricao ?? '',
    dtinicio: sit?.dtinicio ?? '',
    dtprevisao: sit?.dtprevisao ?? '',
    nuos: sit?.nuos?.toString() ?? '',
    totalSituacoes: v.totalSituacoes,
    equipe: sit ? [...sit.operadores, ...sit.mecanicos] : [],
    criadoPor: sit?.criadoPor ?? null,
  };
}

const columns: GridColDef<GridRow>[] = [
  {
    field: 'placa', headerName: 'Placa', width: 100,
    renderCell: (params) => (
      <Box sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>
        {params.value}
      </Box>
    ),
  },
  { field: 'tag', headerName: 'Tag', width: 100 },
  { field: 'tipo', headerName: 'Tipo', width: 140 },
  {
    field: 'situacao', headerName: 'Situacao', width: 200,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: params.row.statusColor }} />
        {params.value}
      </Box>
    ),
  },
  { field: 'statusCategoria', headerName: 'Status', width: 110 },
  { field: 'departamento', headerName: 'Depto', width: 110 },
  {
    field: 'prioridade', headerName: 'Prioridade', width: 100,
    renderCell: (params) => {
      const pri = getPrioridadeInfo(
        params.row.prioridadeSigla === 'U' ? 0 :
        params.row.prioridadeSigla === 'A' ? 1 :
        params.row.prioridadeSigla === 'M' ? 2 :
        params.row.prioridadeSigla === 'B' ? 3 : null
      );
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{
            width: 20, height: 20, borderRadius: '50%',
            bgcolor: pri.color + '33', color: pri.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700,
          }}>
            {params.row.prioridadeSigla}
          </Box>
          {params.value}
        </Box>
      );
    },
  },
  {
    field: 'equipe', headerName: 'Equipe', width: 120, sortable: false, filterable: false,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <PessoaAvatarGroup pessoas={params.value as PainelPessoa[]} max={3} size={22} />
      </Box>
    ),
  },
  { field: 'descricao', headerName: 'Descricao', width: 250 },
  { field: 'marcaModelo', headerName: 'Marca/Modelo', width: 180 },
  { field: 'capacidade', headerName: 'Capacidade', width: 100 },
  { field: 'fabricante', headerName: 'Fabricante', width: 120 },
  { field: 'dtinicio', headerName: 'Inicio', width: 140 },
  { field: 'dtprevisao', headerName: 'Previsao', width: 140 },
  { field: 'nuos', headerName: 'OS', width: 80 },
  { field: 'totalSituacoes', headerName: 'Sit.', width: 60, type: 'number' },
];

export function GridPage() {
  const { data: painel, isLoading } = useHstVeiPainel();

  const rows = useMemo(() => {
    if (!painel?.veiculos) return [];
    return painel.veiculos.map(veiculoToRow);
  }, [painel]);

  return (
    <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        density="compact"
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } },
        }}
        initialState={{
          sorting: { sortModel: [{ field: 'placa', sort: 'asc' }] },
          columns: {
            columnVisibilityModel: { fabricante: false, capacidade: false, dtinicio: false },
          },
        }}
        sx={{
          border: 0,
          '& .MuiDataGrid-cell': { fontSize: '0.8rem' },
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: '0.75rem' },
        }}
      />
    </Box>
  );
}
