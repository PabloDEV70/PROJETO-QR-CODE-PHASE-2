import { useState } from 'react';
import {
  Box, Paper, Typography, Stack, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  useStatsTempoTransito,
  useStatsPorMotorista,
  useStatsPorSolicitante,
  useStatsPorParceiro,
  useStatsVolumeMensal,
  useStatsPorTipo,
  useStatsPorHora,
} from '@/hooks/use-corridas-stats';
import { BUSCAR_LEVAR_LABELS } from '@/types/corrida';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2', '#00838f'];

const PERIODOS = [
  { value: '30', label: 'Ultimos 30 dias' },
  { value: '90', label: 'Ultimos 90 dias' },
  { value: '180', label: 'Ultimos 6 meses' },
  { value: '365', label: 'Ultimo ano' },
  { value: '', label: 'Todo periodo' },
];

export function EstatisticasPage() {
  const [periodo, setPeriodo] = useState('90');

  const dateRange = periodo ? {
    dataInicio: subMonths(new Date(), Number(periodo) / 30).toISOString().slice(0, 10),
    dataFim: new Date().toISOString().slice(0, 10),
  } : undefined;

  const { data: tempo } = useStatsTempoTransito(dateRange);
  const { data: porMotorista } = useStatsPorMotorista(dateRange);
  const { data: porSolicitante } = useStatsPorSolicitante(dateRange);
  const { data: porParceiro } = useStatsPorParceiro(dateRange);
  const { data: volume } = useStatsVolumeMensal();
  const { data: porTipo } = useStatsPorTipo(dateRange);
  const { data: porHora } = useStatsPorHora(dateRange);

  const volumeChart = volume?.slice().reverse().map((v) => ({
    name: format(new Date(v.ano, v.mes - 1), 'MMM yy', { locale: ptBR }),
    corridas: v.corridas,
  })) ?? [];

  const horaChart = porHora?.map((h) => ({
    name: `${String(h.hora).padStart(2, '0')}h`,
    corridas: h.corridas,
  })) ?? [];

  const tipoChart = porTipo?.map((t) => ({
    name: BUSCAR_LEVAR_LABELS[t.tipo] ?? t.label,
    value: t.corridas,
  })) ?? [];

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>Estatisticas</Typography>
        <TextField
          select
          size="small"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          {PERIODOS.map((p) => (
            <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {tempo && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Tempo em Transito
          </Typography>
          <Stack direction="row" spacing={4}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="primary">
                {Math.round(tempo.avgMinutos)} min
              </Typography>
              <Typography variant="caption" color="text.secondary">Media</Typography>
            </Box>
            <Box>
              <Typography variant="h6">{tempo.minMinutos} min</Typography>
              <Typography variant="caption" color="text.secondary">Minimo</Typography>
            </Box>
            <Box>
              <Typography variant="h6">{Math.round(tempo.maxMinutos / 60)}h</Typography>
              <Typography variant="caption" color="text.secondary">Maximo</Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        {volumeChart.length > 0 && (
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Volume Mensal</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeChart}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="corridas" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        )}

        {tipoChart.length > 0 && (
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Por Tipo</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={tipoChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {tipoChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        )}
      </Stack>

      {horaChart.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Distribuicao por Hora
          </Typography>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={horaChart}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="corridas" fill="#ed6c02" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {porMotorista && porMotorista.length > 0 && (
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Por Motorista
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Motorista</TableCell>
                    <TableCell align="right">Corridas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {porMotorista.map((m) => (
                    <TableRow key={m.codigo}>
                      <TableCell>{m.nome}</TableCell>
                      <TableCell align="right">{m.corridas}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {porSolicitante && porSolicitante.length > 0 && (
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Top Solicitantes
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Solicitante</TableCell>
                    <TableCell align="right">Corridas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {porSolicitante.slice(0, 10).map((s) => (
                    <TableRow key={s.codigo}>
                      <TableCell>{s.nome}</TableCell>
                      <TableCell align="right">{s.corridas}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Stack>

      {porParceiro && porParceiro.length > 0 && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Top Parceiros (Destinos)
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Parceiro</TableCell>
                  <TableCell align="right">Corridas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {porParceiro.slice(0, 15).map((p) => (
                  <TableRow key={p.codigo}>
                    <TableCell>{p.nome}</TableCell>
                    <TableCell align="right">{p.corridas}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
