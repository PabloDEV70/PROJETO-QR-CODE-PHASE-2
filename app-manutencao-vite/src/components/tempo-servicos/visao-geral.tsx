import { Grid, Paper, Typography, Skeleton, Box } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line,
} from 'recharts';
import { TIPO_MANUT_MAP } from '@/utils/os-constants';
import { KpiCard } from '@/components/tempo-servicos/kpi-card';
import type { TempoServicosResponse } from '@/types/os-types';

const FAIXA_ORDER = ['< 1h', '1-8h', '8-24h', '1-3d', '3-7d', '7-30d', '30d+'];
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface VisaoGeralProps {
  data: TempoServicosResponse | undefined;
  loading: boolean;
}

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 1 }} />;
}

export function TempoVisaoGeral({ data, loading }: VisaoGeralProps) {
  const barTipoHoras = (data?.porTipo ?? [])
    .filter((t) => t.mediaHoras > 0)
    .map((t) => ({
      name: t.label,
      horas: t.mediaHoras,
      color: TIPO_MANUT_MAP[t.manutencao]?.color ?? '#9e9e9e',
    }));

  const barDistData = (data?.distribuicao ?? [])
    .sort((a, b) => FAIXA_ORDER.indexOf(a.faixa) - FAIXA_ORDER.indexOf(b.faixa));

  const tendenciaData = (data?.tendencia ?? []).map((t) => ({
    label: `${MONTH_NAMES[t.mes - 1]}/${String(t.ano).slice(2)}`,
    mediaHoras: t.mediaHoras,
  }));

  return (
    <>
      {/* KPI cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            label="Total Servicos"
            value={data?.resumo.totalServicos.toLocaleString('pt-BR') ?? '-'}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            label="Com Datas Validas"
            value={`${data?.resumo.pctValidos ?? 0}%`}
            sub={`${data?.resumo.comDatasValidas.toLocaleString('pt-BR') ?? 0} servicos`}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            label="Nunca Executados"
            value={data?.resumo.nuncaExecutados.toLocaleString('pt-BR') ?? '-'}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            label="Media Geral"
            value={`${data?.resumo.mediaHoras ?? 0}h`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Media Horas por Tipo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Media Horas por Tipo de Manutencao
            </Typography>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barTipoHoras} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} unit="h" />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => [`${val}h`, 'Media']} />
                  <Bar dataKey="horas" radius={4}>
                    {barTipoHoras.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Distribuicao por Faixa */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Distribuicao por Faixa de Duracao
            </Typography>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barDistData} margin={{ left: 0, right: 16 }}>
                  <XAxis dataKey="faixa" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip formatter={(val, _name, props) => [
                    `${val} (${props.payload.pct}%)`, 'Servicos',
                  ]} />
                  <Bar dataKey="total" fill="#2e7d32" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Tendencia mensal */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Tendencia Mensal - Media de Horas
            </Typography>
            {loading ? <ChartSkeleton height={240} /> : tendenciaData.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
                <Typography color="text.secondary" variant="body2">Sem dados de tendencia</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={tendenciaData} margin={{ left: 0, right: 16 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="h" />
                  <Tooltip formatter={(val) => [`${val}h`, 'Media']} />
                  <Line
                    type="monotone"
                    dataKey="mediaHoras"
                    stroke="#2e7d32"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
