import { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, CircularProgress,
  ToggleButton, ToggleButtonGroup, Table, TableBody,
  TableCell, TableHead, TableRow,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { format, parseISO } from 'date-fns';
import { usePlanosResumo, usePlanosAderencia, usePlanosAtrasadas } from '@/hooks/use-manutencao';
import type { AderenciaPlano } from '@/types/os-types';

const SITUACAO_COLOR: Record<string, string> = {
  ATRASADA: '#ef4444',
  PROXIMA: '#f59e0b',
  EM_DIA: '#22c55e',
  SEM_HISTORICO: '#9ca3af',
};

const SITUACAO_LABEL: Record<string, string> = {
  ATRASADA: 'Atrasada',
  PROXIMA: 'Proxima',
  EM_DIA: 'Em Dia',
  SEM_HISTORICO: 'Sem Historico',
};

const TIPO_LABEL: Record<string, string> = {
  T: 'Tempo', K: 'KM', H: 'Horimetro', KT: 'KM+Tempo',
};

/** Sankhya API Mother returns {} instead of null for empty values */
function safe(v: unknown): string {
  if (v == null || typeof v === 'object') return '—';
  return String(v);
}

function fmtDate(val: unknown) {
  if (val == null || typeof val === 'object') return '-';
  try { return format(parseISO(String(val)), 'dd/MM/yyyy'); } catch { return String(val); }
}

const COLUMNS: GridColDef<AderenciaPlano>[] = [
  {
    field: 'descricao', headerName: 'Plano', flex: 2, minWidth: 160,
    renderCell: ({ value }) => <Typography variant="body2">{safe(value)}</Typography>,
  },
  {
    field: 'placa', headerName: 'Veiculo', flex: 1.5, minWidth: 120,
    renderCell: ({ row }) => (
      <Box>
        <Typography variant="body2" fontWeight={600}>{safe(row.placa)}</Typography>
      </Box>
    ),
  },
  {
    field: 'tipo', headerName: 'Tipo', width: 110,
    renderCell: ({ value }) => {
      const v = safe(value);
      return <Typography variant="body2">{TIPO_LABEL[v] ?? v}</Typography>;
    },
  },
  {
    field: 'situacao', headerName: 'Situacao', width: 130,
    renderCell: ({ value }) => {
      const v = safe(value);
      return (
        <Chip
          label={SITUACAO_LABEL[v] ?? v}
          size="small"
          sx={{ bgcolor: SITUACAO_COLOR[v] ?? '#9ca3af', color: '#fff', fontWeight: 600 }}
        />
      );
    },
  },
  {
    field: 'diasAtraso', headerName: 'Dias Atraso', width: 110, type: 'number',
    renderCell: ({ value }) => {
      const n = typeof value === 'number' ? value : null;
      return n != null && n !== 0
        ? <Typography variant="body2" color="error.main" fontWeight={600}>{n}d</Typography>
        : <Typography variant="body2" color="text.secondary">-</Typography>;
    },
  },
  {
    field: 'ultimaManutencao', headerName: 'Ultima Manutencao', width: 150,
    renderCell: ({ value }) => <Typography variant="body2">{fmtDate(value)}</Typography>,
  },
];

function SummaryCards() {
  const { data, isLoading } = usePlanosResumo();
  if (isLoading || !data) return null;
  const cards = [
    { label: 'Total Planos', value: data.total, color: 'text.primary' },
    { label: 'Atrasadas', value: data.atrasadas, color: '#ef4444' },
    { label: 'Proximas', value: data.proximas, color: '#f59e0b' },
    { label: 'Em Dia', value: data.emDia, color: '#22c55e' },
  ];
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map(({ label, value, color }) => (
        <Grid key={label} size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h4" fontWeight={700} sx={{ color }}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export function PlanosPage() {
  const [situacao, setSituacao] = useState<string>('');

  const { data: aderencia = [], isLoading: loadingAderencia } = usePlanosAderencia(
    situacao ? { situacao } : undefined,
  );
  const { data: atrasadas = [], isLoading: loadingAtrasadas } = usePlanosAtrasadas();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Planos Preventivos
      </Typography>

      <SummaryCards />

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          Filtrar por Situacao
        </Typography>
        <ToggleButtonGroup
          value={situacao}
          exclusive
          onChange={(_, val) => setSituacao(val ?? '')}
          size="small"
        >
          <ToggleButton value="">Todas</ToggleButton>
          <ToggleButton value="ATRASADA">Atrasada</ToggleButton>
          <ToggleButton value="PROXIMA">Proxima</ToggleButton>
          <ToggleButton value="EM_DIA">Em Dia</ToggleButton>
          <ToggleButton value="SEM_HISTORICO">Sem Historico</ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        {loadingAderencia ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={aderencia}
            columns={COLUMNS}
            getRowId={(r) => `${r.nuplano}-${r.codveiculo}`}
            autoHeight
            pageSizeOptions={[25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            disableRowSelectionOnClick
            sx={{ border: 0 }}
          />
        )}
      </Paper>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Manutencoes Atrasadas
      </Typography>
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {loadingAtrasadas ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Plano</b></TableCell>
                <TableCell><b>Veiculo</b></TableCell>
                <TableCell><b>Dias Atraso</b></TableCell>
                <TableCell><b>Ultima Manutencao</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {atrasadas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Nenhuma manutencao atrasada
                  </TableCell>
                </TableRow>
              ) : atrasadas.map((item: AderenciaPlano) => (
                <TableRow key={`${item.nuplano}-${item.codveiculo}`} hover>
                  <TableCell>{safe(item.descricao)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{safe(item.placa)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="error.main" fontWeight={600}>
                      {typeof item.diasAtraso === 'number' ? `${item.diasAtraso}d` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>{fmtDate(item.ultimaManutencao)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
