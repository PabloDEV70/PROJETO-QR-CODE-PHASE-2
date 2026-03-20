import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, IconButton, Paper, Stack, TextField, Typography,
  alpha, Chip, Alert,
} from '@mui/material';
import {
  ArrowBack, Delete, Add, Edit, Save, Close, Person, CalendarMonth,
} from '@mui/icons-material';
import {
  DataGrid, Toolbar, ToolbarButton, ColumnsPanelTrigger,
  ExportCsv, ExportPrint,
  type GridColDef,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getMotivosAtivos } from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';
import { useRdoDia } from '@/hooks/use-rdo-dia';
import {
  useCreateRdo, useUpdateRdo, useDeleteRdo,
  useAddDetalhe, useUpdateDetalhe, useDeleteDetalhe,
} from '@/hooks/use-rdo-mutations';
import { FuncionarioCombobox } from '@/components/shared/funcionario-combobox';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ApiErrorBanner } from '@/components/shared/api-error-banner';
import { MotivoChip } from '@/components/apontamento/motivo-chip';
import { hhmmToString, stringToHhmm, duracaoMinutos, formatMinutos } from '@/utils/hora-utils';
import type { RdoDetalheItem } from '@/types/rdo-types';

/* ── Row type ── */
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

/* ── Toolbar ── */
interface AtivToolbarProps {
  count: number;
  onRefresh: () => void;
  onAdd: () => void;
  addDisabled: boolean;
}

function AtivToolbar({ count, onRefresh, onAdd, addDisabled }: AtivToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLButtonElement>(null);

  return (
    <Toolbar>
      <Typography fontWeight={700} fontSize={12} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mx: 1 }}>
        Atividades ({count})
      </Typography>
      <Typography fontSize={11} color="text.disabled" sx={{ mx: 1 }}>
        Clique duplo para editar
      </Typography>
      <Box sx={{ flex: 1 }} />
      <Tooltip title="Adicionar atividade">
        <ToolbarButton onClick={onAdd} disabled={addDisabled}>
          <Add fontSize="small" sx={{ color: 'success.main' }} />
        </ToolbarButton>
      </Tooltip>
      <Tooltip title="Colunas">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>
      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
      <Tooltip title="Exportar">
        <ToolbarButton ref={exportRef} onClick={() => setExportOpen(true)}>
          <FileDownloadIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>
      <Menu
        anchorEl={exportRef.current}
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <ExportPrint render={<MuiMenuItem />} onClick={() => setExportOpen(false)}>
          Imprimir
        </ExportPrint>
        <ExportCsv render={<MuiMenuItem />} onClick={() => setExportOpen(false)}>
          Baixar CSV
        </ExportCsv>
      </Menu>
      <Tooltip title="Atualizar">
        <ToolbarButton onClick={onRefresh}>
          <RefreshIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>
    </Toolbar>
  );
}

/* ── Page ── */

export function AdminRdoEditPage() {
  const { codrdo: codrdoParam } = useParams<{ codrdo: string }>();
  const isNew = codrdoParam === 'novo';
  const codrdo = isNew ? 0 : Number(codrdoParam);
  const navigate = useNavigate();

  const { metricas, detalhes, isLoading, error, refetch } = useRdoDia(codrdo);
  const { data: motivos = [] } = useQuery({
    queryKey: ['motivos-ativos'],
    queryFn: getMotivosAtivos,
    ...CACHE_TIMES.motivos,
  });

  const createRdo = useCreateRdo();
  const updateRdo = useUpdateRdo();
  const deleteRdo = useDeleteRdo();
  const addDetalhe = useAddDetalhe();
  const updateDetalhe = useUpdateDetalhe();
  const deleteDetalhe = useDeleteDetalhe();

  // Header state
  const [codparc, setCodparc] = useState<number | null>(null);
  const [dtref, setDtref] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [editingHeader, setEditingHeader] = useState(false);

  useEffect(() => {
    if (metricas && !isNew) {
      setCodparc(metricas.CODPARC);
      setDtref(metricas.DTREF?.split('T')[0] ?? format(new Date(), 'yyyy-MM-dd'));
    }
  }, [metricas, isNew]);

  const rows = useMemo<EditableRow[]>(
    () => [...detalhes].sort((a, b) => (a.HRINI ?? 0) - (b.HRINI ?? 0)).map(detToRow),
    [detalhes],
  );

  const lastHrfim = rows.length > 0 ? rows[rows.length - 1].HRFIM : '07:00';
  const headerValid = codparc != null && dtref.length > 0;

  /* ── Create ── */
  const handleCreateRdo = () => {
    if (!codparc || !dtref) return;
    createRdo.mutate(
      { CODPARC: codparc, DTREF: dtref },
      {
        onSuccess: (result) => {
          const newId = result?.CODRDO;
          if (newId) navigate(`/admin/rdo/${newId}`, { replace: true });
          else navigate('/admin/rdoapontamentos', { replace: true });
        },
      },
    );
  };

  const handleSaveHeader = () => {
    if (!codparc || !dtref) return;
    updateRdo.mutate(
      { codrdo, data: { CODPARC: codparc, DTREF: dtref } },
      { onSuccess: () => setEditingHeader(false) },
    );
  };

  const handleDeleteRdo = () => {
    if (!confirm(`Excluir RDO #${codrdo}? Esta acao nao pode ser desfeita.`)) return;
    deleteRdo.mutate(codrdo, {
      onSuccess: () => navigate('/admin/rdoapontamentos', { replace: true }),
    });
  };

  /* ── Add row ── */
  const handleAddRow = useCallback(() => {
    const nextIni = lastHrfim;
    const [h, m] = nextIni.split(':').map(Number);
    const nextFim = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    addDetalhe.mutate({
      codrdo,
      data: {
        HRINI: stringToHhmm(nextIni),
        HRFIM: stringToHhmm(nextFim),
        RDOMOTIVOCOD: motivos[0]?.RDOMOTIVOCOD ?? 1,
      },
    } as never);
  }, [codrdo, lastHrfim, motivos, addDetalhe]);

  /* ── Cell edit ── */
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

  const motivoValueOptions = useMemo(
    () => motivos.map((m) => ({ value: m.RDOMOTIVOCOD, label: `${m.SIGLA} - ${m.DESCRICAO}` })),
    [motivos],
  );

  /* ── Columns ── */
  const columns = useMemo<GridColDef<EditableRow>[]>(() => [
    {
      field: 'HRINI', headerName: 'Inicio', width: 90, editable: true,
      renderCell: (p) => <Typography fontSize={13} fontWeight={500} fontFamily="monospace">{p.value}</Typography>,
    },
    {
      field: 'HRFIM', headerName: 'Fim', width: 90, editable: true,
      renderCell: (p) => <Typography fontSize={13} fontWeight={500} fontFamily="monospace">{p.value}</Typography>,
    },
    {
      field: 'duracao', headerName: 'Duracao', width: 80,
      renderCell: (p) => {
        const dur = duracaoMinutos(stringToHhmm(p.row.HRINI), stringToHhmm(p.row.HRFIM));
        const isProd = p.row.motivoProdutivo === 'S';
        return <Typography fontSize={12} fontWeight={600} color={isProd ? '#16A34A' : '#F59E0B'}>{dur > 0 ? formatMinutos(dur) : '-'}</Typography>;
      },
    },
    {
      field: 'RDOMOTIVOCOD', headerName: 'Motivo', flex: 1, minWidth: 150,
      editable: true, type: 'singleSelect', valueOptions: motivoValueOptions,
      renderCell: (p) => <MotivoChip sigla={p.row.motivoSigla} descricao={p.row.motivoDescricao} produtivo={p.row.motivoProdutivo as 'S' | 'N'} />,
    },
    {
      field: 'NUOS', headerName: 'OS', width: 80, editable: true, type: 'number',
      renderCell: (p) => <Typography fontSize={13} color={p.value ? 'text.primary' : 'text.disabled'}>{p.value ?? '-'}</Typography>,
    },
    {
      field: 'OBS', headerName: 'Obs', flex: 1, minWidth: 120, editable: true,
      renderCell: (p) => <Typography fontSize={12} color="text.secondary" noWrap>{p.value || '-'}</Typography>,
    },
    {
      field: 'actions', headerName: '', width: 40, sortable: false, filterable: false, disableColumnMenu: true,
      renderCell: (p) => (
        <IconButton size="small" color="error" onClick={() => handleDeleteAtiv(p.row.id)} disabled={deleteDetalhe.isPending}>
          <Delete sx={{ fontSize: 16 }} />
        </IconButton>
      ),
    },
  ], [motivoValueOptions, handleDeleteAtiv, deleteDetalhe.isPending]);

  if (!isNew && isLoading) return <LoadingSkeleton message="Carregando RDO..." />;

  /* ── Mestre section (new mode) ── */
  const renderNewMestre = () => (
    <Paper
      variant="outlined"
      sx={{
        p: 3, borderRadius: 2,
        borderLeft: 4, borderLeftColor: 'primary.main',
      }}
    >
      <Typography fontWeight={700} fontSize={14} sx={{ mb: 2 }}>
        Preencha os dados do RDO
      </Typography>

      <Stack spacing={2.5}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Person sx={{ fontSize: 20, color: 'text.secondary', mr: 0.5 }} />
          <Typography fontSize={13} fontWeight={600} color="text.secondary" sx={{ minWidth: 100 }}>
            Funcionario
          </Typography>
        </Stack>
        <FuncionarioCombobox
          value={codparc}
          onChange={(v) => setCodparc(v)}
          required
          label="Buscar funcionario"
          placeholder="Digite o nome..."
        />

        <Stack direction="row" spacing={0.5} alignItems="center">
          <CalendarMonth sx={{ fontSize: 20, color: 'text.secondary', mr: 0.5 }} />
          <Typography fontSize={13} fontWeight={600} color="text.secondary" sx={{ minWidth: 100 }}>
            Data Referencia
          </Typography>
        </Stack>
        <TextField
          type="date" size="small" fullWidth required
          value={dtref}
          onChange={(e) => setDtref(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleCreateRdo}
          disabled={!headerValid || createRdo.isPending}
          startIcon={<Save />}
          sx={{ mt: 1 }}
        >
          {createRdo.isPending ? 'Criando...' : 'Criar RDO e adicionar atividades'}
        </Button>
      </Stack>
    </Paper>
  );

  /* ── Mestre section (edit mode) ── */
  const renderEditMestre = () => (
    <Paper
      variant="outlined"
      sx={{
        p: 2, borderRadius: 2,
        borderLeft: 4, borderLeftColor: 'success.main',
      }}
    >
      {editingHeader ? (
        <Stack spacing={2}>
          <Typography fontWeight={700} fontSize={13} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Editando Cabecalho
          </Typography>
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <FuncionarioCombobox
                value={codparc}
                onChange={(v) => setCodparc(v)}
                required
                label="Funcionario"
              />
            </Box>
            <TextField
              label="Data Referencia" type="date" size="small" required
              value={dtref} onChange={(e) => setDtref(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 180 }}
            />
            <Stack direction="row" spacing={0.5} sx={{ height: 40 }}>
              <Button size="small" onClick={() => setEditingHeader(false)} startIcon={<Close />}>
                Cancelar
              </Button>
              <Button
                size="small" variant="contained"
                onClick={handleSaveHeader}
                disabled={!headerValid || updateRdo.isPending}
                startIcon={<Save />}
              >
                Salvar
              </Button>
            </Stack>
          </Stack>
        </Stack>
      ) : metricas ? (
        <Stack direction="row" spacing={2} alignItems="center">
          <FuncionarioAvatar codparc={metricas.CODPARC ?? 0} nome={metricas.nomeparc ?? ''} size="medium" />
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={700} fontSize={16}>{metricas.nomeparc ?? '-'}</Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
              <Chip
                label={metricas.DTREF?.split('T')[0] ?? '-'}
                size="small" variant="outlined"
                sx={{ fontWeight: 600, fontSize: 12 }}
              />
              {metricas.departamento && (
                <Typography fontSize={12} color="text.secondary">{metricas.departamento}</Typography>
              )}
              {metricas.cargo && (
                <Typography fontSize={12} color="text.secondary">· {metricas.cargo}</Typography>
              )}
            </Stack>
          </Box>
          {metricas.totalMinutos != null && metricas.totalMinutos > 0 && (
            <Chip
              label={formatMinutos(metricas.totalMinutos)}
              size="small" color="info" variant="outlined"
              sx={{ fontWeight: 700, fontSize: 12 }}
            />
          )}
          {metricas.produtividadePercent != null && (
            <Chip
              label={`${Math.round(metricas.produtividadePercent)}% prod`}
              size="small"
              sx={{
                fontWeight: 700, fontSize: 12,
                bgcolor: alpha(metricas.produtividadePercent >= 50 ? '#16A34A' : '#F59E0B', 0.1),
                color: metricas.produtividadePercent >= 50 ? '#16A34A' : '#F59E0B',
              }}
            />
          )}
          <IconButton size="small" onClick={() => setEditingHeader(true)}>
            <Edit fontSize="small" />
          </IconButton>
        </Stack>
      ) : null}
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 4 }}>
      {/* Nav */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton onClick={() => navigate('/admin/rdoapontamentos')} size="small">
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
          {isNew ? 'Novo RDO' : `RDO #${codrdo}`}
        </Typography>
        {!isNew && (
          <Button
            color="error" size="small" startIcon={<Delete />}
            onClick={handleDeleteRdo} disabled={deleteRdo.isPending}
          >
            Excluir RDO
          </Button>
        )}
      </Stack>

      <ApiErrorBanner error={error} onRetry={refetch} context={`AdminRdoEdit #${codrdo}`} />

      {/* Mestre */}
      {isNew ? renderNewMestre() : renderEditMestre()}

      {/* Detalhes — somente quando temos mestre salvo */}
      {isNew ? (
        <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
          Preencha o funcionario e a data acima para criar o RDO. Apos criado, voce podera adicionar atividades.
        </Alert>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataGrid<EditableRow>
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            density="compact"
            autoHeight
            disableRowSelectionOnClick
            hideFooter={rows.length <= 100}
            editMode="cell"
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={(err) => console.error('Row update error:', err)}
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            showToolbar
            slots={{ toolbar: AtivToolbar as never }}
            slotProps={{
              toolbar: {
                count: rows.length,
                onRefresh: refetch,
                onAdd: handleAddRow,
                addDisabled: addDetalhe.isPending,
              } as never,
            }}
            sx={{
              border: 0,
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: (t) => t.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.02),
              },
              '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
              '& .MuiDataGrid-cell': { py: 0.5 },
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
        </Paper>
      )}
    </Box>
  );
}

export default AdminRdoEditPage;
