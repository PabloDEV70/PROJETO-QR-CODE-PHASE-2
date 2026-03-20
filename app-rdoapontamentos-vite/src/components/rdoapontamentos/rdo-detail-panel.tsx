import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import {
  DataGrid, Toolbar, ToolbarButton, ColumnsPanelTrigger,
  type GridColDef,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { alpha } from '@mui/material/styles';
import { getRdoDetalhes, getMotivosAtivos } from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';
import {
  useAddDetalhe, useUpdateDetalhe, useDeleteDetalhe,
} from '@/hooks/use-rdo-mutations';
import { MotivoChip } from '@/components/apontamento/motivo-chip';
import { hhmmToString, stringToHhmm, duracaoMinutos, formatMinutos } from '@/utils/hora-utils';
import type { RdoDetalheItem } from '@/types/rdo-types';

interface EditableRow {
  id: number;
  HRINI: string;
  HRFIM: string;
  RDOMOTIVOCOD: number | null;
  motivoSigla: string;
  motivoDescricao: string;
  motivoProdutivo: string;
  NUOS: number | null;
  OBS: string;
}

function detToRow(d: RdoDetalheItem): EditableRow {
  return {
    id: d.ITEM,
    HRINI: hhmmToString(d.HRINI),
    HRFIM: hhmmToString(d.HRFIM),
    RDOMOTIVOCOD: d.RDOMOTIVOCOD,
    motivoSigla: d.motivoSigla ?? '',
    motivoDescricao: d.motivoDescricao ?? '',
    motivoProdutivo: d.motivoProdutivo ?? 'N',
    NUOS: d.NUOS ?? null,
    OBS: d.OBS ?? '',
  };
}

interface RdoDetailPanelProps {
  codrdo: number;
}

export function RdoDetailPanel({ codrdo }: RdoDetailPanelProps) {
  const { data: detalhes = [], isLoading, refetch } = useQuery({
    queryKey: ['rdo-detalhes', codrdo],
    queryFn: () => getRdoDetalhes(codrdo),
    ...CACHE_TIMES.rdoDetail,
  });

  const { data: motivos = [] } = useQuery({
    queryKey: ['motivos-ativos'],
    queryFn: getMotivosAtivos,
    ...CACHE_TIMES.motivos,
  });

  const addDetalhe = useAddDetalhe();
  const updateDetalhe = useUpdateDetalhe();
  const deleteDetalhe = useDeleteDetalhe();

  const rows = useMemo<EditableRow[]>(
    () => [...detalhes].sort((a, b) => (a.HRINI ?? 0) - (b.HRINI ?? 0)).map(detToRow),
    [detalhes],
  );

  const lastHrfim = rows.length > 0 ? rows[rows.length - 1].HRFIM : '07:00';

  const motivoValueOptions = useMemo(
    () => motivos.map((m) => ({ value: m.RDOMOTIVOCOD, label: `${m.SIGLA} - ${m.DESCRICAO}` })),
    [motivos],
  );

  const handleAddRow = useCallback(() => {
    const nextIni = lastHrfim;
    const [h, m] = nextIni.split(':').map(Number);
    const nextFim = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const data = {
      HRINI: stringToHhmm(nextIni),
      HRFIM: stringToHhmm(nextFim),
      RDOMOTIVOCOD: motivos[0]?.RDOMOTIVOCOD ?? 1,
    };
    addDetalhe.mutate({ codrdo, data } as never);
  }, [codrdo, lastHrfim, motivos, addDetalhe]);

  const processRowUpdate = useCallback((newRow: EditableRow, oldRow: EditableRow) => {
    const changed: Partial<Record<string, unknown>> = {};
    if (newRow.HRINI !== oldRow.HRINI) changed.HRINI = stringToHhmm(newRow.HRINI);
    if (newRow.HRFIM !== oldRow.HRFIM) changed.HRFIM = stringToHhmm(newRow.HRFIM);
    if (newRow.RDOMOTIVOCOD !== oldRow.RDOMOTIVOCOD) changed.RDOMOTIVOCOD = newRow.RDOMOTIVOCOD;
    if (newRow.NUOS !== oldRow.NUOS) changed.NUOS = newRow.NUOS;
    if (newRow.OBS !== oldRow.OBS) changed.OBS = newRow.OBS || null;

    if (Object.keys(changed).length > 0) {
      updateDetalhe.mutate({ codrdo, item: newRow.id, data: changed as never });
    }

    if (newRow.RDOMOTIVOCOD !== oldRow.RDOMOTIVOCOD) {
      const mot = motivos.find((m) => m.RDOMOTIVOCOD === newRow.RDOMOTIVOCOD);
      if (mot) {
        newRow.motivoSigla = mot.SIGLA;
        newRow.motivoDescricao = mot.DESCRICAO;
        newRow.motivoProdutivo = mot.PRODUTIVO;
      }
    }
    return newRow;
  }, [codrdo, motivos, updateDetalhe]);

  const handleDeleteAtiv = useCallback((item: number) => {
    if (!confirm('Excluir esta atividade?')) return;
    deleteDetalhe.mutate({ codrdo, item });
  }, [codrdo, deleteDetalhe]);

  const columns = useMemo<GridColDef<EditableRow>[]>(() => [
    {
      field: 'HRINI', headerName: 'Inicio', width: 85, editable: true,
      renderCell: (p) => <Typography fontSize={12} fontFamily="monospace">{p.value}</Typography>,
    },
    {
      field: 'HRFIM', headerName: 'Fim', width: 85, editable: true,
      renderCell: (p) => <Typography fontSize={12} fontFamily="monospace">{p.value}</Typography>,
    },
    {
      field: 'duracao', headerName: 'Dur.', width: 70,
      renderCell: (p) => {
        const dur = duracaoMinutos(stringToHhmm(p.row.HRINI), stringToHhmm(p.row.HRFIM));
        const isProd = p.row.motivoProdutivo === 'S';
        return (
          <Typography fontSize={11} fontWeight={600} color={isProd ? '#16A34A' : '#F59E0B'}>
            {dur > 0 ? formatMinutos(dur) : '-'}
          </Typography>
        );
      },
    },
    {
      field: 'RDOMOTIVOCOD', headerName: 'Motivo', flex: 1, minWidth: 140,
      editable: true, type: 'singleSelect', valueOptions: motivoValueOptions,
      renderCell: (p) => (
        <MotivoChip
          sigla={p.row.motivoSigla}
          descricao={p.row.motivoDescricao}
          produtivo={p.row.motivoProdutivo as 'S' | 'N'}
        />
      ),
    },
    {
      field: 'NUOS', headerName: 'OS', width: 70, editable: true, type: 'number',
      renderCell: (p) => <Typography fontSize={12} color={p.value ? 'text.primary' : 'text.disabled'}>{p.value ?? '-'}</Typography>,
    },
    {
      field: 'OBS', headerName: 'Obs', flex: 1, minWidth: 100, editable: true,
      renderCell: (p) => <Typography fontSize={11} color="text.secondary" noWrap>{p.value || '-'}</Typography>,
    },
    {
      field: 'actions', headerName: '', width: 36, sortable: false, filterable: false, disableColumnMenu: true,
      renderCell: (p) => (
        <IconButton size="small" color="error" onClick={() => handleDeleteAtiv(p.row.id)} disabled={deleteDetalhe.isPending}>
          <Delete sx={{ fontSize: 14 }} />
        </IconButton>
      ),
    },
  ], [motivoValueOptions, handleDeleteAtiv, deleteDetalhe.isPending]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 4, py: 1.5, bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.02) : alpha('#000', 0.015) }}>
      <DataGrid<EditableRow>
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        density="compact"
        autoHeight
        disableRowSelectionOnClick
        hideFooter
        editMode="cell"
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={(err) => console.error('Detail update error:', err)}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        showToolbar
        slots={{
          toolbar: () => (
            <Toolbar>
              <Typography fontWeight={700} fontSize={11} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mx: 0.5 }}>
                Atividades ({rows.length})
              </Typography>
              <Typography fontSize={10} color="text.disabled" sx={{ mx: 0.5 }}>
                Clique duplo para editar
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Tooltip title="Adicionar atividade">
                <ToolbarButton onClick={handleAddRow} disabled={addDetalhe.isPending}>
                  <Add sx={{ fontSize: 16, color: 'success.main' }} />
                </ToolbarButton>
              </Tooltip>
              <Tooltip title="Colunas">
                <ColumnsPanelTrigger render={<ToolbarButton />}>
                  <ViewColumnIcon sx={{ fontSize: 16 }} />
                </ColumnsPanelTrigger>
              </Tooltip>
              <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
              <Tooltip title="Atualizar">
                <ToolbarButton onClick={() => refetch()}>
                  <RefreshIcon sx={{ fontSize: 16 }} />
                </ToolbarButton>
              </Tooltip>
            </Toolbar>
          ),
        }}
        sx={{
          border: 1, borderColor: 'divider', borderRadius: 1,
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.02),
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 11 },
          },
          '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
          '& .MuiDataGrid-cell': { py: 0.25, fontSize: 12 },
          '& .MuiDataGrid-cell--editable': {
            cursor: 'cell',
            '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) },
          },
          '& .MuiDataGrid-cell--editing': {
            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
            boxShadow: (t) => `inset 0 0 0 2px ${t.palette.primary.main}`,
          },
        }}
      />
    </Box>
  );
}
