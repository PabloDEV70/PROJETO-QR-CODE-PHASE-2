import {
  Box, Typography, Paper, Grid, Skeleton,
  Table, TableBody, TableCell, TableHead, TableRow, Chip, Link,
} from '@mui/material';
import {
  Dashboard, BuildCircle, CheckCircle, Engineering, Warning, AttachMoney,
} from '@mui/icons-material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { useOsKpis, useOsAtivasDetalhadas, useMediaDiasPorTipo, useManDashboard } from '@/hooks/use-manutencao';
import { OS_STATUS_MAP, TIPO_MANUT_MAP } from '@/utils/os-constants';

/** Sankhya API Mother returns {} instead of null for empty values */
function safeVal(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'object') return '—';
  return String(v);
}
function safeNum(v: unknown, fallback = 0): number {
  if (v == null || typeof v === 'object') return fallback;
  return Number(v) || fallback;
}

function KpiCard({ label, value, icon, color, loading }: {
  label: string; value: number | string; icon: React.ReactNode; color: string; loading?: boolean;
}) {
  return (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{
        width: 48, height: 48, borderRadius: 2, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        bgcolor: `${color}14`, color,
      }}>
        {icon}
      </Box>
      <Box>
        {loading ? <Skeleton width={60} height={32} /> : (
          <Typography variant="h5" fontWeight={700}>{value}</Typography>
        )}
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </Paper>
  );
}

function StatusBadge({ status }: { status: string }) {
  const def = OS_STATUS_MAP[status as keyof typeof OS_STATUS_MAP];
  if (!def) return <Chip label={status} size="small" />;
  return (
    <Chip
      label={def.label}
      size="small"
      sx={{ bgcolor: def.bg, color: def.fg, fontWeight: 600, fontSize: 11 }}
    />
  );
}

export function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useOsKpis();
  const { data: dashboard, isLoading: dashLoading } = useManDashboard();
  const { data: ativas, isLoading: ativasLoading } = useOsAtivasDetalhadas(10);
  const { data: mediaDias, isLoading: mediaLoading } = useMediaDiasPorTipo();

  const pieData = (dashboard?.porStatus ?? []).map((s) => ({
    name: OS_STATUS_MAP[s.status as keyof typeof OS_STATUS_MAP]?.label ?? s.statusLabel ?? s.status ?? '?',
    value: s.total,
    color: OS_STATUS_MAP[s.status as keyof typeof OS_STATUS_MAP]?.color ?? '#9e9e9e',
  }));

  const barTipoData = (dashboard?.porTipoManutencao ?? []).map((t) => ({
    name: TIPO_MANUT_MAP[t.manutencao ?? '']?.label ?? t.manutencaoLabel ?? t.manutencao ?? '?',
    total: t.total,
    color: TIPO_MANUT_MAP[t.manutencao ?? '']?.color ?? '#9e9e9e',
  }));

  const barMediaData = (mediaDias ?? []).map((m) => ({
    name: m.label,
    dias: Number((m.mediaDias ?? 0).toFixed(1)),
    color: TIPO_MANUT_MAP[m.manutencao]?.color ?? '#9e9e9e',
  }));

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Dashboard</Typography>

      {/* KPI Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Ativas', value: kpis?.totalAtivas ?? 0, icon: <Dashboard />, color: '#1976d2' },
          { label: 'Abertas', value: kpis?.osAbertas ?? 0, icon: <BuildCircle />, color: '#f59e0b' },
          { label: 'Em Execucao', value: kpis?.osEmExecucao ?? 0, icon: <Engineering />, color: '#0ea5e9' },
          { label: 'Corretivas', value: kpis?.corretivas ?? 0, icon: <CheckCircle />, color: '#22c55e' },
          { label: 'Atrasadas', value: kpis?.atrasadas ?? 0, icon: <Warning />, color: '#ef4444' },
        ].map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <KpiCard {...kpi} loading={kpisLoading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Preventivas + Bloqueio */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AttachMoney sx={{ color: '#22c55e' }} />
              <Typography variant="subtitle2" color="text.secondary">Preventivas / Bloqueio</Typography>
            </Box>
            {kpisLoading ? <Skeleton width="80%" height={48} /> : (
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {kpis?.preventivas ?? 0} preventivas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {kpis?.comBloqueioComercial ?? 0} com bloqueio comercial
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* OS por Status Pie */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>OS por Status</Typography>
            {dashLoading ? <Skeleton height={200} /> : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {pieData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [val, 'OS']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* OS por Tipo */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>OS por Tipo Manutencao</Typography>
            {dashLoading ? <Skeleton height={200} /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barTipoData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="total" radius={4}>
                    {barTipoData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Media Dias por Tipo */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Media Dias para Fechar por Tipo</Typography>
            {mediaLoading ? <Skeleton height={220} /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barMediaData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
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
      </Grid>

      {/* OS Ativas Detalhadas */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>OS Ativas Detalhadas</Typography>
        {ativasLoading ? <Skeleton height={200} /> : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 11 }}>NUOS</TableCell>
                  <TableCell sx={{ fontSize: 11 }}>Placa</TableCell>
                  <TableCell sx={{ fontSize: 11 }}>Status</TableCell>
                  <TableCell sx={{ fontSize: 11 }}>Tipo</TableCell>
                  <TableCell sx={{ fontSize: 11 }}>Prazo</TableCell>
                  <TableCell align="right" sx={{ fontSize: 11 }}>Dias</TableCell>
                  <TableCell align="right" sx={{ fontSize: 11 }}>Servicos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(ativas ?? []).map((os) => (
                  <TableRow key={os.nuos} hover>
                    <TableCell>
                      <Link href={`/ordens-de-servico/${os.nuos}`} underline="hover" sx={{ fontWeight: 600, fontSize: 12 }}>
                        #{os.nuos}
                      </Link>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{safeVal(os.placa)}</TableCell>
                    <TableCell><StatusBadge status={safeVal(os.status) || 'A'} /></TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {TIPO_MANUT_MAP[safeVal(os.manutencao)]?.label ?? safeVal(os.manutencaoDesc)}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const prazo = safeVal(os.situacaoPrazo);
                        return (
                          <Chip
                            label={prazo}
                            size="small"
                            sx={{
                              fontSize: 10,
                              fontWeight: 600,
                              bgcolor: prazo === 'ATRASADA' ? '#fee2e2' : prazo === 'PROXIMA' ? '#fef3c7' : '#dcfce7',
                              color: prazo === 'ATRASADA' ? '#ef4444' : prazo === 'PROXIMA' ? '#f59e0b' : '#22c55e',
                            }}
                          />
                        );
                      })()}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 12 }}>{safeNum(os.diasEmManutencao)}d</TableCell>
                    <TableCell align="right" sx={{ fontSize: 12 }}>
                      {safeNum(os.servicosConcluidos)}/{safeNum(os.qtdServicos)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
