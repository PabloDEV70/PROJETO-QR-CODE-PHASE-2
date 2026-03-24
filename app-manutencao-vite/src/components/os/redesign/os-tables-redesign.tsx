import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Chip, 
  Stack, 
  useTheme, 
  Paper,
  Button,
  Divider
} from '@mui/material';
import { 
  DataGrid, 
  type GridColDef, 
  GridToolbarContainer, 
  GridToolbarFilterButton, 
  GridToolbarExport, 
  GridToolbarDensitySelector,
  GridToolbarQuickFilter
} from '@mui/x-data-grid';
import { 
  Wrench, 
  UserCog, 
  Clock,
  Plus,
  UserPlus,
  Settings2
} from 'lucide-react';
import type { OsDetailEnriched, OsDetailServico, OsDetailExecutor } from '@/types/os-types';

interface OsTablesRedesignProps {
  os: OsDetailEnriched;
}

// Custom Toolbar para Serviços
function CustomServiceToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1, gap: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(0,0,0,0.01)' }}>
      <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
        <GridToolbarQuickFilter
          placeholder="Buscar serviço..."
        />
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, alignSelf: 'center' }} />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport slotProps={{ button: { sx: { fontSize: 12, fontWeight: 700, color: 'text.secondary' } } }} />
      </Box>
      <Button 
        variant="contained" 
        size="small" 
        startIcon={<Plus size={16} />}
        disableElevation
        sx={{ height: 32, borderRadius: 0.5, fontWeight: 800 }}
      >
        Novo Serviço
      </Button>
    </GridToolbarContainer>
  );
}

// Custom Toolbar para Executores
function CustomExecutorToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1, gap: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(0,0,0,0.01)' }}>
      <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
        <GridToolbarQuickFilter
          placeholder="Buscar executor..."
        />
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, alignSelf: 'center' }} />
        <GridToolbarFilterButton />
        <GridToolbarExport slotProps={{ button: { sx: { fontSize: 12, fontWeight: 700, color: 'text.secondary' } } }} />
      </Box>
      <Button 
        variant="contained" 
        size="small" 
        color="secondary"
        startIcon={<UserPlus size={16} />}
        disableElevation
        sx={{ height: 32, borderRadius: 0.5, fontWeight: 800 }}
      >
        Vincular Executor
      </Button>
    </GridToolbarContainer>
  );
}

function fmtDate(v: string | null) {
  if (!v) return '-';
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtCur(v: number | null) {
  if (v == null || v === 0) return '-';
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function fmtMin(m: number | null) {
  if (m == null) return '-';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r > 0 ? `${h}h${r}min` : `${h}h`;
}

const SVC_STATUS: Record<string, { label: string; color: string }> = {
  E: { label: 'Execução', color: '#0ea5e9' },
  F: { label: 'Finalizado', color: '#22c55e' },
  R: { label: 'Realizado', color: '#22c55e' },
  A: { label: 'Aberto', color: '#f59e0b' },
};

export function OsTablesRedesign({ os }: OsTablesRedesignProps) {
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const svcCols: GridColDef<OsDetailServico>[] = [
    { 
      field: 'SEQUENCIA', 
      headerName: '#', 
      width: 50,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', fontFamily: 'monospace' }}>
          {String(value).padStart(2, '0')}
        </Typography>
      )
    },
    {
      field: 'nomeProduto', 
      headerName: 'Serviço', 
      flex: 1, 
      minWidth: 250,
      renderCell: ({ row }) => (
        <Box sx={{ py: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
            {row.nomeProduto ?? `Cod. ${row.CODPROD}`}
          </Typography>
          {row.OBSERVACAO && (
            <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5, fontStyle: 'italic', lineHeight: 1.1 }}>
              {row.OBSERVACAO}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'STATUS', 
      headerName: 'Status', 
      width: 100,
      renderCell: ({ value }) => {
        const d = SVC_STATUS[value as string];
        return d ? (
          <Chip 
            label={d.label} 
            size="small" 
            sx={{ 
              height: 20, 
              fontSize: 10, 
              fontWeight: 800,
              bgcolor: `${d.color}15`, 
              color: d.color, 
              borderRadius: 0.25,
              border: '1px solid',
              borderColor: `${d.color}30`
            }} 
          />
        ) : <Typography variant="body2">{value || '-'}</Typography>;
      },
    },
    { 
      field: 'QTD', 
      headerName: 'Qtd', 
      width: 60, 
      type: 'number',
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
      )
    },
    {
      field: 'VLRUNIT', 
      headerName: 'Unit.', 
      width: 100, 
      align: 'right', 
      headerAlign: 'right',
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{fmtCur(value as number)}</Typography>
      ),
    },
    {
      field: 'VLRTOT', 
      headerName: 'Total', 
      width: 110, 
      align: 'right', 
      headerAlign: 'right',
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'monospace' }}>
          {fmtCur(value as number)}
        </Typography>
      ),
    },
    {
      field: 'TEMPO', 
      headerName: 'Tempo', 
      width: 90,
      renderCell: ({ value }) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Clock size={12} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{fmtMin(value as number)}</Typography>
        </Stack>
      ),
    },
  ];

  const execCols: GridColDef<OsDetailExecutor>[] = [
    { 
      field: 'SEQUENCIA', 
      headerName: 'Seq', 
      width: 50,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>{value}</Typography>
      )
    },
    {
      field: 'nomeUsuario', 
      headerName: 'Executor', 
      flex: 1, 
      minWidth: 200,
      renderCell: ({ row }) => (
        <Box sx={{ py: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{row.nomeUsuario ?? '-'}</Typography>
          {row.nomeColaborador && row.nomeColaborador !== row.nomeUsuario && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.nomeColaborador}</Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'dtIni', 
      headerName: 'Período', 
      width: 250,
      renderCell: ({ row }) => (
        <Stack spacing={0.2} sx={{ py: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.disabled">DE</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{fmtDate(row.dtIni)}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.disabled">ATÉ</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{fmtDate(row.dtFin)}</Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'minutos', 
      headerName: 'Duração', 
      width: 100,
      renderCell: ({ value }) => (
        <Chip 
          label={fmtMin(value as number)} 
          size="small" 
          variant="outlined" 
          sx={{ fontWeight: 700, fontSize: 11, borderRadius: 0.25 }} 
        />
      ),
    },
    {
      field: 'obs', 
      headerName: 'Observação', 
      flex: 1, 
      minWidth: 200,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'normal', lineHeight: 1.3, py: 1 }}>
          {(value as string) ?? '-'}
        </Typography>
      ),
    },
  ];

  const gridSx = {
    border: 'none',
    '& .MuiDataGrid-cell': {
      borderColor: 'divider',
      '&:focus, &:focus-within': { outline: 'none' },
    },
    '& .MuiDataGrid-columnHeaders': {
      bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      borderBottom: '1px solid',
      borderColor: 'divider',
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 800, 
      fontSize: 11, 
      textTransform: 'uppercase', 
      letterSpacing: '0.05em',
      color: 'text.secondary',
    },
    '& .MuiDataGrid-row:hover': {
      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.01)',
    },
    '& .MuiDataGrid-footerContainer': { borderTop: '1px solid', borderColor: 'divider' },
  };

  return (
    <Box sx={{ p: 2, pt: 0, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
      <Paper 
        sx={{ 
          borderRadius: 0.25,
          overflow: 'hidden', 
          border: '1px solid', 
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          bgcolor: isDark ? 'background.paper' : 'white',
          boxShadow: 'none'
        }}
      >
        <Box sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.005)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Tabs 
              value={tab} 
              onChange={(_, v) => setTab(v)}
              sx={{ 
                minHeight: 48,
                '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 700, fontSize: 13 }
              }}
            >
              <Tab icon={<Wrench size={16} />} iconPosition="start" label={`Serviços (${os.servicos.length})`} />
              <Tab icon={<UserCog size={16} />} iconPosition="start" label={`Executores (${os.executores.length})`} />
            </Tabs>
            
            <Button size="small" startIcon={<Settings2 size={14} />} sx={{ color: 'text.secondary', fontWeight: 700 }}>
              Configurar Colunas
            </Button>
          </Stack>
        </Box>

        <Box sx={{ flex: 1 }}>
          {tab === 0 && (
            <DataGrid
              rows={os.servicos}
              columns={svcCols}
              getRowId={(r) => `${r.NUOS}-${r.SEQUENCIA}`}
              getRowHeight={() => 'auto'}
              disableRowSelectionOnClick
              sx={gridSx}
              slots={{ toolbar: CustomServiceToolbar }}
              slotProps={{
                toolbar: { showQuickFilter: true }
              }}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
            />
          )}

          {tab === 1 && (
            <DataGrid
              rows={os.executores}
              columns={execCols}
              getRowId={(r) => `${r.NUOS}-${r.SEQUENCIA}-${r.codusu}-${r.dtIni}`}
              getRowHeight={() => 'auto'}
              disableRowSelectionOnClick
              sx={gridSx}
              slots={{ toolbar: CustomExecutorToolbar }}
              slotProps={{
                toolbar: { showQuickFilter: true }
              }}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
}
