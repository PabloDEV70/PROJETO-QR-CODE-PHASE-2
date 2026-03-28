import { Box, Paper, Typography, Stack, Skeleton, Chip } from '@mui/material';
import {
  DirectionsCar, CheckCircle, Cancel, HourglassEmpty, AccessTime,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCorridasResumo, useCorridasList } from '@/hooks/use-corridas';
import { useStatsTempoTransito, useStatsVolumeMensal } from '@/hooks/use-corridas-stats';
import { STATUS_LABELS, STATUS_COLORS, BUSCAR_LEVAR_LABELS } from '@/types/corrida';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function StatCard({ label, value, color, icon, onClick }: {
  label: string; value: number | string; color: string;
  icon: React.ReactNode; onClick?: () => void;
}) {
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 2, flex: 1, minWidth: 140, cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { bgcolor: 'action.hover' } : {},
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>{value}</Typography>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: resumo, isLoading: loadingResumo } = useCorridasResumo();
  const { data: tempo, isLoading: loadingTempo } = useStatsTempoTransito();
  const { data: volume } = useStatsVolumeMensal();
  const { data: corridasHoje } = useCorridasList({
    dataInicio: new Date().toISOString().slice(0, 10),
    limit: 10,
    orderBy: 'DT_CREATED',
    orderDir: 'DESC',
  });

  if (loadingResumo) {
    return (
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={80} variant="rounded" />)}
        </Stack>
      </Box>
    );
  }

  const chartData = volume?.slice().reverse().map((v) => ({
    name: format(new Date(v.ano, v.mes - 1), 'MMM yy', { locale: ptBR }),
    corridas: v.corridas,
  })) ?? [];

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Painel de Corridas
      </Typography>

      <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 3 }}>
        <StatCard
          label="Abertas"
          value={resumo?.abertas ?? 0}
          color={STATUS_COLORS['0']}
          icon={<HourglassEmpty />}
          onClick={() => navigate('/corridas?status=0')}
        />
        <StatCard
          label="Em Andamento"
          value={resumo?.emAndamento ?? 0}
          color={STATUS_COLORS['1']}
          icon={<DirectionsCar />}
          onClick={() => navigate('/corridas?status=1')}
        />
        <StatCard
          label="Concluidas"
          value={resumo?.concluidas ?? 0}
          color={STATUS_COLORS['2']}
          icon={<CheckCircle />}
        />
        <StatCard
          label="Canceladas"
          value={resumo?.canceladas ?? 0}
          color={STATUS_COLORS['3']}
          icon={<Cancel />}
        />
      </Stack>

      {!loadingTempo && tempo && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <AccessTime sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" fontWeight={600}>Tempo em Transito</Typography>
          </Stack>
          <Stack direction="row" spacing={3}>
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
            <Box>
              <Typography variant="h6">{tempo.totalConcluidas}</Typography>
              <Typography variant="caption" color="text.secondary">Concluidas</Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {chartData.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Volume Mensal
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="corridas" fill="#1976d2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {corridasHoje && corridasHoje.data.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
            Corridas de Hoje
          </Typography>
          <Stack spacing={1}>
            {corridasHoje.data.map((c) => (
              <Paper
                key={c.ID}
                variant="outlined"
                onClick={() => navigate(`/corridas/${c.ID}`)}
                sx={{ p: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      #{c.ID} - {c.NOMEPARC ?? c.DESTINO ?? 'Sem destino'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {c.NOMESOLICITANTE} &middot; {BUSCAR_LEVAR_LABELS[c.BUSCARLEVAR] ?? c.BUSCARLEVAR}
                      {c.PASSAGEIROSMERCADORIA ? ` &middot; ${c.PASSAGEIROSMERCADORIA.slice(0, 50)}` : ''}
                    </Typography>
                  </Box>
                  <Chip
                    label={STATUS_LABELS[c.STATUS] ?? c.STATUS}
                    size="small"
                    sx={{
                      bgcolor: `${STATUS_COLORS[c.STATUS] ?? '#999'}18`,
                      color: STATUS_COLORS[c.STATUS] ?? '#999',
                      fontWeight: 600, fontSize: 11,
                    }}
                  />
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
