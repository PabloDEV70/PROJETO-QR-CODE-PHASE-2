import { Box, Typography, Paper, Grid, Skeleton, Chip } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { useTecnicosProdutividade } from '@/hooks/use-manutencao';
import type { TecnicoProdutividade } from '@/types/os-types';

const PODIUM_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const PODIUM_LABELS = ['1º', '2º', '3º'];

function fmtHoras(minutos: number | null) {
  if (minutos == null || minutos === 0) return '—';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function PodiumCard({ tecnico, rank }: { tecnico: TecnicoProdutividade; rank: number }) {
  const color = PODIUM_COLORS[rank] ?? '#9e9e9e';
  return (
    <Paper sx={{ p: 2.5, borderTop: `4px solid ${color}`, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <EmojiEvents sx={{ color, fontSize: 28 }} />
        <Chip label={PODIUM_LABELS[rank]} size="small" sx={{ bgcolor: color, color: '#fff', fontWeight: 700 }} />
      </Box>
      <Typography variant="subtitle1" fontWeight={700} noWrap>{tecnico.nomeUsuario ?? '—'}</Typography>
      <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          OS Total: <strong>{tecnico.totalOs}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Servicos: <strong>{tecnico.totalServicos}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Media/Servico: <strong>{fmtHoras(tecnico.mediaMinutosServico)}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: <strong>{fmtHoras(tecnico.totalMinutos)}</strong>
        </Typography>
      </Box>
    </Paper>
  );
}

const columns: GridColDef<TecnicoProdutividade>[] = [
  {
    field: 'rank',
    headerName: '#',
    width: 60,
    sortable: false,
    renderCell: (params) => {
      const rows = params.api.getSortedRowIds();
      const idx = rows.indexOf(params.id);
      return <Typography variant="body2" fontWeight={600}>{idx + 1}</Typography>;
    },
  },
  {
    field: 'nomeUsuario',
    headerName: 'Nome',
    flex: 1,
    minWidth: 160,
    renderCell: (params) => (
      <Typography variant="body2" fontWeight={600}>{params.value ?? '—'}</Typography>
    ),
  },
  {
    field: 'totalOs',
    headerName: 'OS Total',
    width: 100,
    align: 'right',
    headerAlign: 'right',
  },
  {
    field: 'totalServicos',
    headerName: 'Servicos',
    width: 110,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => (
      <Chip label={params.value} size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700 }} />
    ),
  },
  {
    field: 'mediaMinutosServico',
    headerName: 'Media/Servico',
    width: 130,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (value: number | null) => fmtHoras(value),
  },
  {
    field: 'totalMinutos',
    headerName: 'Total Horas',
    width: 130,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (value: number | null) => fmtHoras(value),
  },
];

export function RankingPage() {
  const { data = [], isLoading } = useTecnicosProdutividade();

  const sorted = [...data].sort((a, b) => b.totalOs - a.totalOs);
  const top3 = sorted.slice(0, 3);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Ranking Executores
      </Typography>

      {/* Podium */}
      {isLoading ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[0, 1, 2].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 4 }}>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      ) : top3.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {top3.map((tecnico, i) => (
            <Grid key={tecnico.codusu} size={{ xs: 12, sm: 4 }}>
              <PodiumCard tecnico={tecnico} rank={i} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* DataGrid */}
      <Paper sx={{ height: 480 }}>
        <DataGrid
          rows={sorted}
          columns={columns}
          getRowId={(r) => r.codusu}
          loading={isLoading}
          initialState={{
            sorting: { sortModel: [{ field: 'totalOs', sort: 'desc' }] },
          }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          disableRowSelectionOnClick
          density="compact"
        />
      </Paper>
    </Box>
  );
}
