import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, parseISO } from 'date-fns';
import { ptBR as datePtBR } from 'date-fns/locale';
import { CrudDataGrid } from '@/components/shared/crud-data-grid';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { RdoDetailPanel } from '@/components/rdoapontamentos/rdo-detail-panel';
import { prodColor } from '@/utils/produtividade-utils';
import type { RdoCabecalho } from '@/types/rdo-types';

function fmtMin(min: number | null | undefined): string {
  if (!min) return '-';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h ${String(m).padStart(2, '0')}min` : `${h}h`;
}

interface RdoAdminDataGridProps {
  rows: RdoCabecalho[];
  loading: boolean;
  total: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (rdo: RdoCabecalho) => void;
  onDelete: (rdo: RdoCabecalho) => void;
  dataInicio: string;
  onDataInicioChange: (v: string) => void;
  dataFim: string;
  onDataFimChange: (v: string) => void;
  extraDateFilters?: React.ReactNode;
}

export function RdoAdminDataGrid({
  rows, loading, total, paginationModel, onPaginationModelChange,
  sortModel, onSortModelChange,
  onRefresh, onAdd, onEdit, onDelete,
  dataInicio, onDataInicioChange, dataFim, onDataFimChange,
  extraDateFilters,
}: RdoAdminDataGridProps) {
  const navigate = useNavigate();

  const columns = useMemo<GridColDef<RdoCabecalho>[]>(() => [
    {
      field: 'CODRDO',
      headerName: '#',
      width: 64,
      type: 'number',
      renderCell: (p) => (
        <Typography
          variant="body2"
          component="a"
          href={`/rdo/${p.value}`}
          onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate(`/rdo/${p.value}`); }}
          sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          #{p.value}
        </Typography>
      ),
    },
    {
      field: 'nomeparc',
      headerName: 'Funcionario',
      flex: 1,
      minWidth: 180,
      renderCell: (p) => {
        const sub = [p.row.departamento, p.row.cargo].filter(Boolean).join(' · ');
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden', py: 0.5 }}>
            <FuncionarioAvatar codparc={p.row.CODPARC ?? 0} nome={p.row.nomeparc ?? ''} size="small" />
            <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" noWrap fontWeight={500} lineHeight={1.3} fontSize={13}>
                {p.row.nomeparc || '-'}
              </Typography>
              {sub && (
                <Typography variant="caption" color="text.secondary" noWrap lineHeight={1.2} fontSize={11}>
                  {sub}
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'DTREF',
      headerName: 'Data',
      width: 110,
      renderCell: (p) => {
        if (!p.row.DTREF || typeof p.row.DTREF !== 'string') return <Typography variant="body2" color="text.disabled">-</Typography>;
        try {
          const d = parseISO(p.row.DTREF);
          const full = format(d, 'dd/MM/yyyy', { locale: datePtBR });
          const weekday = format(d, 'EEE', { locale: datePtBR });
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <Typography variant="body2" fontWeight={600} fontSize={13} lineHeight={1.3}>{full}</Typography>
              <Typography variant="caption" color="text.secondary" fontSize={10.5} lineHeight={1.2} sx={{ textTransform: 'capitalize' }}>{weekday}</Typography>
            </Box>
          );
        } catch { return <Typography variant="body2">{String(p.row.DTREF)}</Typography>; }
      },
    },
    {
      field: 'primeiraHora',
      headerName: 'Periodo',
      width: 110,
      renderCell: (p) => {
        const ini = p.row.primeiraHora;
        const fim = p.row.ultimaHora;
        if (!ini && !fim) return <Typography variant="caption" color="text.disabled">-</Typography>;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <Typography variant="body2" fontSize={12.5} color="text.secondary" fontFamily="monospace" lineHeight={1.3}>
              {ini || '?'} - {fim || '?'}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'totalItens',
      headerName: 'Ativ.',
      width: 52,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (p) => {
        const v = p.row.totalItens;
        if (!v) return <Typography variant="body2" color="text.disabled">-</Typography>;
        return <Typography variant="body2" fontWeight={600} fontSize={13}>{v}</Typography>;
      },
    },
    {
      field: 'totalMinutos',
      headerName: 'Horas',
      width: 90,
      align: 'right',
      headerAlign: 'right',
      renderCell: (p) => {
        const txt = fmtMin(p.value as number | null);
        if (txt === '-') return <Typography variant="body2" color="text.disabled">-</Typography>;
        return (
          <Typography variant="body2" fontWeight={600} fontSize={13} fontFamily="monospace">
            {txt}
          </Typography>
        );
      },
    },
    {
      field: 'produtividadePercent',
      headerName: 'Produtiv.',
      width: 110,
      renderCell: (p) => {
        const pct = p.row.produtividadePercent;
        if (pct == null) return <Typography variant="caption" color="text.disabled">-</Typography>;
        const color = prodColor(pct);
        return (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(pct, 100)}
              sx={{
                flex: 1, height: 6, borderRadius: 3,
                bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
              }}
            />
            <Typography variant="caption" fontWeight={700} fontSize={12} sx={{ minWidth: 30, color }}>
              {Math.round(pct)}%
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'qtdOs',
      headerName: 'OS',
      width: 46,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (p) => {
        const v = p.row.qtdOs;
        if (!v) return <Typography variant="body2" color="text.disabled">-</Typography>;
        return <Typography variant="body2" fontWeight={600} fontSize={13} color="info.main">{v}</Typography>;
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 70,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (p) => (
        <Stack direction="row" spacing={0}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(p.row); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(p.row); }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ], [onEdit, onDelete, navigate]);

  const dateFilters = extraDateFilters ?? (
    <Stack direction="row" spacing={1}>
      <TextField type="date" size="small" label="De" value={dataInicio}
        onChange={(e) => onDataInicioChange(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 150 }} />
      <TextField type="date" size="small" label="Ate" value={dataFim}
        onChange={(e) => onDataFimChange(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 150 }} />
    </Stack>
  );

  return (
    <CrudDataGrid<RdoCabecalho>
      rows={rows}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.CODRDO}
      rowCount={total}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      sortModel={sortModel}
      onSortModelChange={onSortModelChange}
      title="RDO Apontamentos"
      onAdd={onAdd}
      onRefresh={onRefresh}
      extraFilters={dateFilters}
      rowHeight={64}
      height="calc(100vh - 280px)"
      getDetailPanelContent={({ row }) => <RdoDetailPanel codrdo={row.CODRDO} />}
      getDetailPanelHeight={() => 'auto'}
    />
  );
}
