import {
  Box, Typography, Paper, Grid, CircularProgress, Skeleton,
} from '@mui/material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { useMediaDiasPorTipo, useOsAtivasDetalhadas } from '@/hooks/use-manutencao';
import { useOsResumo } from '@/hooks/use-ordens-servico';
import { OS_STATUS_MAP, TIPO_MANUT_MAP, STATUSGIG_MAP } from '@/utils/os-constants';

function ChartSkeleton({ height = 240 }: { height?: number }) {
  return <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 1 }} />;
}

export function AnalyticsPage() {
  const { data: mediaDias = [], isLoading: mediaLoading } = useMediaDiasPorTipo();
  const { data: resumo, isLoading: resumoLoading } = useOsResumo({});
  const { data: ativas = [], isLoading: ativasLoading } = useOsAtivasDetalhadas(100);

  // Media Dias por Tipo — horizontal bar
  const barMediaData = mediaDias.map((m) => ({
    name: m.label,
    dias: Number(Number(m.mediaDias).toFixed(1)),
    color: TIPO_MANUT_MAP[m.manutencao]?.color ?? '#9e9e9e',
  }));

  // OS por Status — donut
  const pieStatusData = (resumo?.porStatus ?? []).map((s) => ({
    name: OS_STATUS_MAP[s.status as keyof typeof OS_STATUS_MAP]?.label ?? s.label,
    value: s.total,
    color: OS_STATUS_MAP[s.status as keyof typeof OS_STATUS_MAP]?.color ?? '#9e9e9e',
  }));

  // OS Ativas por tipo MANUTENCAO — bar (backend returns camelCase)
  const tipoCount: Record<string, number> = {};
  ativas.forEach((os) => {
    const key = os.manutencao ?? 'Outros';
    tipoCount[key] = (tipoCount[key] ?? 0) + 1;
  });
  const barAtivasData = Object.entries(tipoCount).map(([key, total]) => ({
    name: TIPO_MANUT_MAP[key]?.label ?? key,
    total,
    color: TIPO_MANUT_MAP[key]?.color ?? '#9e9e9e',
  })).sort((a, b) => b.total - a.total);

  // OS por StatusGig — bar
  const barStatusGigData = (resumo?.porStatusGig ?? []).map((s) => ({
    name: STATUSGIG_MAP[s.statusGig]?.label ?? s.label,
    total: s.total,
    color: STATUSGIG_MAP[s.statusGig]?.impeditivo ? '#ef4444' : '#0ea5e9',
  }));

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Media Dias por Tipo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Media Dias para Fechar por Tipo
            </Typography>
            {mediaLoading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barMediaData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} unit="d" />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => [`${val} dias`, 'Media']} />
                  <Bar dataKey="dias" radius={4}>
                    {barMediaData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* OS por Status — donut */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              OS por Status
            </Typography>
            {resumoLoading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {pieStatusData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [val, 'OS']} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* OS Ativas por Tipo MANUTENCAO */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              OS Ativas por Tipo de Manutencao
            </Typography>
            {ativasLoading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barAtivasData} margin={{ left: 0, right: 16 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip formatter={(val) => [val, 'OS Ativas']} />
                  <Bar dataKey="total" radius={4}>
                    {barAtivasData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* OS por StatusGig */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              OS por Status GIG
            </Typography>
            {resumoLoading ? <ChartSkeleton /> : barStatusGigData.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
                <Typography color="text.secondary" variant="body2">Sem dados de StatusGig</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barStatusGigData} margin={{ left: 0, right: 16 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip formatter={(val) => [val, 'OS']} />
                  <Bar dataKey="total" radius={4}>
                    {barStatusGigData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {(mediaLoading || resumoLoading || ativasLoading) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={20} />
        </Box>
      )}
    </Box>
  );
}
