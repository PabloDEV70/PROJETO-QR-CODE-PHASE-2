import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useCorridasResumo } from '@/hooks/use-corridas';
import {
  useStatsTempoTransito, useStatsVolumeMensal, useStatsPorTipo,
  useStatsPorHora, useStatsPorMotorista, useStatsPorSolicitante,
  useStatsPorParceiro,
} from '@/hooks/use-corridas-stats';
import { CorridasKpiRow } from '@/components/corridas/corridas-kpi-row';
import { useCorridasUrlParams } from '@/hooks/use-corridas-url-params';
import type { RankingItem } from '@/types/corrida';

const PIE_COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2'];

function RankingTable({ title, data }: { title: string; data?: RankingItem[] }) {
  return (
    <Paper variant="outlined" sx={{ flex: 1, minWidth: 300 }}>
      <Typography variant="subtitle2" sx={{ px: 2, py: 1.5, fontWeight: 600, borderBottom: '1px solid', borderColor: 'divider' }}>
        {title}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell align="right">Corridas</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(data ?? []).slice(0, 10).map((item) => (
            <TableRow key={item.codigo}>
              <TableCell sx={{ fontSize: '0.8rem' }}>{item.nome}</TableCell>
              <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.corridas}</TableCell>
            </TableRow>
          ))}
          {(!data || data.length === 0) && (
            <TableRow>
              <TableCell colSpan={2} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                Sem dados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}

export function CorridasDashboard() {
  const { params } = useCorridasUrlParams();
  const dateRange = {
    ...(params.dataInicio && { dataInicio: params.dataInicio }),
    ...(params.dataFim && { dataFim: params.dataFim }),
  };

  const { data: resumo, isLoading: loadingResumo } = useCorridasResumo();
  const { data: tempoTransito } = useStatsTempoTransito(dateRange);
  const { data: volumeMensal } = useStatsVolumeMensal();
  const { data: porTipo } = useStatsPorTipo(dateRange);
  const { data: porHora } = useStatsPorHora(dateRange);
  const { data: porMotorista } = useStatsPorMotorista(dateRange);
  const { data: porSolicitante } = useStatsPorSolicitante(dateRange);
  const { data: porParceiro } = useStatsPorParceiro(dateRange);

  const volumeData = (volumeMensal ?? []).map((v) => ({
    label: `${String(v.mes).padStart(2, '0')}/${v.ano}`,
    corridas: v.corridas,
  }));

  const horaData = (porHora ?? []).map((h) => ({
    label: `${String(h.hora).padStart(2, '0')}h`,
    corridas: h.corridas,
  }));

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <CorridasKpiRow resumo={resumo} tempoTransito={tempoTransito} loading={loadingResumo} />

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Volume Mensal
        </Typography>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={volumeData}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="corridas" fill="#1976d2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Paper variant="outlined" sx={{ flex: 1, minWidth: 300, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Tempo Transito
          </Typography>
          {tempoTransito ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">Media</Typography>
              <Typography variant="body2" fontWeight={600}>{Math.round(tempoTransito.avgMinutos)} min</Typography>
              <Typography variant="body2" color="text.secondary">Minimo</Typography>
              <Typography variant="body2" fontWeight={600}>{tempoTransito.minMinutos} min</Typography>
              <Typography variant="body2" color="text.secondary">Maximo</Typography>
              <Typography variant="body2" fontWeight={600}>{tempoTransito.maxMinutos} min</Typography>
              <Typography variant="body2" color="text.secondary">Concluidas</Typography>
              <Typography variant="body2" fontWeight={600}>{tempoTransito.totalConcluidas}</Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">Carregando...</Typography>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ flex: 1, minWidth: 300, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Por Tipo
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={porTipo ?? []}
                dataKey="corridas"
                nameKey="label"
                cx="50%" cy="50%"
                outerRadius={70}
                label={({ label, corridas }) => `${label}: ${corridas}`}
              >
                {(porTipo ?? []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <RankingTable title="Por Motorista" data={porMotorista} />
        <RankingTable title="Por Solicitante" data={porSolicitante} />
      </Box>

      <RankingTable title="Por Parceiro (Top 15)" data={porParceiro?.slice(0, 15)} />

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Por Hora do Dia
        </Typography>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={horaData}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="corridas" fill="#ed6c02" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
