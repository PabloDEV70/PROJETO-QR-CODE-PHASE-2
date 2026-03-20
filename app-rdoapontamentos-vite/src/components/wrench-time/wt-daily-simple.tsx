import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Box, Typography, Stack, useTheme, useMediaQuery } from '@mui/material';
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

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export function WtDailySimple({ data, isLoading, onBarClick }: WtDailySimpleProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // On mobile, show only last 7 days to avoid overcrowding
  const visibleData = useMemo(() => {
    if (!isMobile || data.length <= 7) return data;
    return data.slice(-7);
  }, [data, isMobile]);

  const chartData = useMemo(() => visibleData.map((r) => {
    const dt = new Date(r.date + 'T12:00:00');
    const dayIdx = dt.getDay();
    const day = dt.getDate().toString().padStart(2, '0');
    const month = (dt.getMonth() + 1).toString().padStart(2, '0');
    const dayLabel = isMobile
      ? `${WEEKDAY_SHORT[dayIdx]} ${day}`
      : `${WEEKDAY_SHORT[dayIdx]} ${day}/${month}`;
    const total = r.totalMin;
    return {
      ...r,
      dayLabel,
      prodPct: total > 0 ? Math.round((r.prodMin / total) * 100) : 0,
      nonProdPct: total > 0 ? Math.round((r.nonProdMin / total) * 100) : 0,
    };
  }), [visibleData, isMobile]);

  const avgWt = useMemo(() => {
    const prod = data.reduce((s, r) => s + r.prodMin, 0);
    const total = data.reduce((s, r) => s + r.totalMin, 0);
    return total > 0 ? Math.round((prod / total) * 100) : 0;
  }, [data]);

  if (!isLoading && data.length === 0) {
    return (
      <ChartContainer title="Produtivo vs Improdutivo" height={180}>
        <Stack alignItems="center" justifyContent="center" sx={{ height: 140 }}>
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
        borderRadius: 1, p: 1, minWidth: 140, boxShadow: 2,
      }}>
        <Typography variant="caption" fontWeight={600}>
          {r.date.slice(8, 10)}/{r.date.slice(5, 7)}
        </Typography>
        <Row label="Prod" color="#16A34A" value={fmtMin(r.prodMin)} pct={r.wtPercent} />
        <Row label="Improd" color="#94A3B8" value={fmtMin(r.nonProdMin)} pct={100 - r.wtPercent} />
        <Stack direction="row" justifyContent="space-between"
          sx={{ pt: 0.5, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" fontWeight={600}>Total</Typography>
          <Typography variant="caption" fontWeight={600}>{fmtMin(r.totalMin)}</Typography>
        </Stack>
      </Stack>
    );
  };

  const barClick = onBarClick
    ? (_: unknown, idx: number) => { if (chartData[idx]) onBarClick(chartData[idx].date); }
    : undefined;

  const chartHeight = isMobile ? 200 : 260;
  const barSize = isMobile
    ? Math.max(14, Math.min(24, 220 / chartData.length))
    : Math.max(12, Math.min(28, 500 / chartData.length));

  const subtitle = isMobile && data.length > 7
    ? `WT Medio: ${avgWt}% (ultimos 7 dias)`
    : `WT Medio: ${avgWt}%`;

  return (
    <ChartContainer
      title="Produtivo vs Improdutivo"
      subtitle={subtitle}
      height={chartHeight}
      isLoading={isLoading}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={isMobile
            ? { top: 4, right: 4, left: -16, bottom: 0 }
            : { top: 5, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="dayLabel"
            interval={0}
            tick={{ fontSize: isMobile ? 9 : 11 }}
            tickLine={false}
            axisLine={false}
            height={isMobile ? 28 : 24}
          />
          <YAxis
            tick={{ fontSize: isMobile ? 9 : 10 }}
            tickLine={false}
            axisLine={false}
            width={isMobile ? 30 : 36}
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip content={renderTooltip as never} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar
            dataKey="prodPct" name="Produtivo" stackId="a"
            fill="#16A34A" fillOpacity={0.8} maxBarSize={barSize}
            cursor={onBarClick ? 'pointer' : undefined}
            onClick={barClick}
          />
          <Bar
            dataKey="nonProdPct" name="Improdutivo" stackId="a"
            fill="#94A3B8" fillOpacity={0.6} maxBarSize={barSize}
            radius={[2, 2, 0, 0]}
            cursor={onBarClick ? 'pointer' : undefined}
            onClick={barClick}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Inline legend */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 0.5 }}>
        <LegendDot color="#16A34A" label="Produtivo" />
        <LegendDot color="#94A3B8" label="Improdutivo" />
      </Box>
    </ChartContainer>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: color }} />
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
        {label}
      </Typography>
    </Box>
  );
}

function Row({ label, color, value, pct }: {
  label: string; color: string; value: string; pct: number;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1}>
      <Typography variant="caption" sx={{ color, fontSize: 11 }}>{label}</Typography>
      <Typography variant="caption" fontWeight={600} sx={{ fontSize: 11 }}>{pct}% ({value})</Typography>
    </Stack>
  );
}
