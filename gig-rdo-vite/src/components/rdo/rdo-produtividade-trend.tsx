import { useMemo } from 'react';
import { Typography, Stack, Chip, useTheme, useMediaQuery } from '@mui/material';
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChartContainer } from '@/components/charts/chart-container';
import type { RdoTimelinePoint } from '@/types/rdo-analytics-types';

interface ChartRow {
  label: string;
  prodPct: number;
  media: number | null;
  horasProd: number;
  horasTotal: number;
  tooltip: string;
}

function rollingAvg(data: number[], window: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < window - 1) return null;
    const slice = data.slice(i - window + 1, i + 1);
    return Number((slice.reduce((s, v) => s + v, 0) / slice.length).toFixed(1));
  });
}

function computeProdPct(p: RdoTimelinePoint): number {
  const total = Math.max(0, Number(p.totalHoras) || 0);
  const prod = Math.max(0, Number(p.horasProdutivas) || 0);
  return total > 0 ? Math.round((prod / total) * 100) : 0;
}

interface Props {
  data?: RdoTimelinePoint[];
  isLoading?: boolean;
  /** Overall produtividade % from dashboard (for reference line) */
  produtividadePercent?: number;
}

export function RdoProdutividadeTrend({ data, isLoading, produtividadePercent }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { chartData, trend, avg } = useMemo(() => {
    if (!data?.length) return { chartData: [], trend: null, avg: 0 };

    const dailyPcts = data.map(computeProdPct);
    const avgs = rollingAvg(dailyPcts, 3);
    const avgAll = Math.round(dailyPcts.reduce((s, v) => s + v, 0) / dailyPcts.length);

    const rows: ChartRow[] = data.map((p, i) => ({
      label: format(parseISO(p.DTREF), isMobile ? 'dd/MM' : 'dd MMM', { locale: ptBR }),
      prodPct: dailyPcts[i]!,
      media: avgs[i] ?? null,
      horasProd: Math.max(0, Number(p.horasProdutivas) || 0),
      horasTotal: Math.max(0, Number(p.totalHoras) || 0),
      tooltip: format(parseISO(p.DTREF), "EEEE, dd 'de' MMMM", { locale: ptBR }),
    }));

    // Trend: compare 2nd half avg vs 1st half avg
    let t = null;
    if (rows.length >= 4) {
      const half = Math.floor(rows.length / 2);
      const avg1 = rows.slice(0, half).reduce((s, r) => s + r.prodPct, 0) / half;
      const avg2 = rows.slice(half).reduce((s, r) => s + r.prodPct, 0) / (rows.length - half);
      if (avg1 > 0) {
        const diff = avg2 - avg1;
        t = { diff: diff.toFixed(0), up: diff > 0 };
      }
    }

    return { chartData: rows, trend: t, avg: avgAll };
  }, [data, isMobile]);

  const refPct = produtividadePercent ?? avg;

  return (
    <ChartContainer
      title="Tendencia de Produtividade"
      subtitle={`ATVP / Total horas — media ${avg}%`}
      height={isMobile ? 200 : 240}
      isLoading={isLoading}
      action={
        <Stack direction="row" spacing={1} alignItems="center">
          {trend && (
            <Chip
              size="small"
              label={`${trend.up ? '+' : ''}${trend.diff}pp 2a metade`}
              sx={{
                height: 22, fontSize: 11, fontWeight: 700,
                bgcolor: trend.up ? 'rgba(22,163,74,0.1)' : 'rgba(211,47,47,0.1)',
                color: trend.up ? '#16A34A' : '#d32f2f',
              }}
            />
          )}
        </Stack>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-prod" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16A34A" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#16A34A" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="label" tick={{ fontSize: 10 }}
            interval="preserveStartEnd" tickMargin={4}
          />
          <YAxis
            domain={[0, 100]} tick={{ fontSize: 10 }} width={35}
            tickFormatter={(v: number) => `${v}%`}
          />
          {refPct > 0 && (
            <ReferenceLine
              y={refPct} stroke="#78909c" strokeDasharray="6 4"
              label={{
                value: `Media ${refPct}%`, position: 'right',
                fill: '#78909c', fontSize: 10,
              }}
            />
          )}
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0]?.payload as ChartRow | undefined;
              if (!row) return null;
              return (
                <Stack sx={{
                  p: 1.5, borderRadius: 2,
                  bgcolor: 'background.paper', border: 1, borderColor: 'divider',
                  boxShadow: 4, minWidth: 160,
                }}>
                  <Typography variant="caption" fontWeight={700}>
                    {row.tooltip}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#16A34A', fontWeight: 700, mt: 0.5 }}>
                    {row.prodPct}% produtivo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ATVP: {row.horasProd.toFixed(1)}h / Total: {row.horasTotal.toFixed(1)}h
                  </Typography>
                  {row.media != null && (
                    <Typography variant="caption" color="text.secondary">
                      Media movel 3d: {row.media}%
                    </Typography>
                  )}
                </Stack>
              );
            }}
          />
          <Area
            dataKey="prodPct" name="Produtividade %"
            stroke="#16A34A" strokeWidth={2.5}
            fill="url(#grad-prod)" dot={{ r: 3, fill: '#16A34A' }}
          />
          <Line
            dataKey="media" name="Media movel 3d"
            stroke="#EC4899" strokeWidth={2} strokeDasharray="5 3"
            dot={false} connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
