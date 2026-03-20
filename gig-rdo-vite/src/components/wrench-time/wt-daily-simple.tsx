import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Typography, Stack, useTheme, useMediaQuery } from '@mui/material';
import { ChartContainer } from '@/components/charts/chart-container';
import { fmtMin } from '@/utils/wrench-time-categories';

interface TrendRow {
  date: string;
  label: string;
  wtPercent: number;
  prodMin: number;
  nonProdMin: number;
  totalMin: number;
  expectedMin: number;
}

interface WtDailySimpleProps {
  data: TrendRow[];
  isLoading?: boolean;
  onBarClick?: (date: string) => void;
}

export function WtDailySimple({ data, isLoading, onBarClick }: WtDailySimpleProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const WEEKDAY_SIGLAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  const chartData = useMemo(() => data.map((r) => {
    const dt = new Date(r.date + 'T12:00:00');
    const sigla = WEEKDAY_SIGLAS[dt.getDay()];
    const dayLabel = `${sigla} ${r.label}`;
    const total = r.totalMin;
    return {
      ...r,
      dayLabel,
      prodPct: total > 0 ? Math.round((r.prodMin / total) * 100) : 0,
      nonProdPct: total > 0 ? Math.round((r.nonProdMin / total) * 100) : 0,
    };
  }), [data]);

  const avgWt = useMemo(() => {
    const prod = data.reduce((s, r) => s + r.prodMin, 0);
    const total = data.reduce((s, r) => s + r.totalMin, 0);
    return total > 0 ? Math.round((prod / total) * 100) : 0;
  }, [data]);

  if (!isLoading && data.length === 0) {
    return (
      <ChartContainer title="Produtivo vs Improdutivo (Diario)" height={250}>
        <Stack alignItems="center" justifyContent="center" sx={{ height: 200 }}>
          <Typography variant="body2" color="text.secondary">
            Sem dados para o periodo
          </Typography>
        </Stack>
      </ChartContainer>
    );
  }

  const renderTooltip = ({ active, payload }: {
    active?: boolean; payload?: readonly { payload: (typeof chartData)[number] }[];
  }) => {
    if (!active || !payload?.length) return null;
    const r = payload[0]?.payload;
    if (!r) return null;
    return (
      <Stack sx={{
        bgcolor: 'background.paper', border: 1, borderColor: 'divider',
        borderRadius: 1, p: 1.5, minWidth: 180, boxShadow: 2,
      }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          {r.date.slice(8, 10)}/{r.date.slice(5, 7)}/{r.date.slice(0, 4)}
        </Typography>
        <Stack spacing={0.25}>
          <Row label="Produtivo" color="#16A34A" value={fmtMin(r.prodMin)} pct={r.wtPercent} />
          <Row
            label="Improdutivo" color="#94A3B8"
            value={fmtMin(r.nonProdMin)} pct={100 - r.wtPercent}
          />
          <Stack direction="row" justifyContent="space-between" spacing={2}
            sx={{ pt: 0.5, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" fontWeight={600}>Total:</Typography>
            <Typography variant="caption" fontWeight={600}>{fmtMin(r.totalMin)}</Typography>
          </Stack>
        </Stack>
      </Stack>
    );
  };

  const barClick = onBarClick
    ? (_: unknown, idx: number) => { if (chartData[idx]) onBarClick(chartData[idx].date); }
    : undefined;
  const cursor = onBarClick ? 'pointer' : undefined;

  return (
    <ChartContainer
      title="Produtivo vs Improdutivo (Diario)"
      subtitle={`WT Medio: ${avgWt}% | Percentual produtivo vs improdutivo por dia`}
      height={isMobile ? 210 : 280}
      isLoading={isLoading}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="dayLabel" interval={0} tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} width={36} domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`} />
          <Tooltip content={renderTooltip} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="prodPct" name="Produtivo" stackId="a"
            fill="#16A34A" fillOpacity={0.8} maxBarSize={32}
            cursor={cursor} onClick={barClick}
          />
          <Bar dataKey="nonProdPct" name="Improdutivo" stackId="a"
            fill="#94A3B8" fillOpacity={0.6} maxBarSize={32} radius={[3, 3, 0, 0]}
            cursor={cursor} onClick={barClick}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

function Row({ label, color, value, pct }: {
  label: string; color: string; value: string; pct: number;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="caption" sx={{ color }}>{label}:</Typography>
      <Typography variant="caption" fontWeight={600}>{pct}% ({value})</Typography>
    </Stack>
  );
}
