import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { Typography, Stack, useTheme, useMediaQuery } from '@mui/material';
import { ChartContainer } from '@/components/charts/chart-container';
import { fmtMin } from '@/utils/wrench-time-categories';

interface WtDailyStackProps {
  data: Array<{
    date: string;
    label: string;
    wtPercent: number;
    prodMin: number;
    nonProdMin: number;
    totalMin: number;
    expectedMin: number;
    overtimeMin: number;
    overtimeProdMin: number;
    overtimeNonProdMin: number;
    ma7: number | null;
  }>;
  isLoading?: boolean;
  onBarClick?: (date: string) => void;
}

export function WtDailyStack({ data, isLoading, onBarClick }: WtDailyStackProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  const chartData = useMemo(() => data.map((r) => {
    const base = r.expectedMin || r.totalMin;
    const regProd = Math.max(0, r.prodMin - r.overtimeProdMin);
    const regNonProd = Math.max(0, r.nonProdMin - r.overtimeNonProdMin);
    const dt = new Date(r.date + 'T12:00:00');
    const dayLabel = `${DIAS[dt.getDay()]} ${r.label}`;
    return {
      ...r, dayLabel,
      prodPctBar: base > 0 ? Math.round((regProd / base) * 100) : 0,
      nonProdPctBar: base > 0 ? Math.round((regNonProd / base) * 100) : 0,
      hexProdPctBar: base > 0 ? Math.round((r.overtimeProdMin / base) * 100) : 0,
      hexNonProdPctBar: base > 0 ? Math.round((r.overtimeNonProdMin / base) * 100) : 0,
    };
  }), [data]);

  const avgWtPercent = useMemo(() => {
    const totProd = data.reduce((s, r) => s + r.prodMin, 0);
    const totAll = data.reduce((s, r) => s + r.totalMin, 0);
    return totAll > 0 ? Math.round((totProd / totAll) * 100) : 0;
  }, [data]);

  if (!isLoading && data.length === 0) {
    return (
      <ChartContainer title="Wrench Time Diario" height={250}>
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
        borderRadius: 1, p: 1.5, minWidth: 200, boxShadow: 2,
      }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          {`${r.date.slice(8, 10)}/${r.date.slice(5, 7)}/${r.date.slice(0, 4)}`}
        </Typography>
        <Stack spacing={0.25}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant="caption" sx={{ color: '#16A34A' }}>WT Produtivo:</Typography>
            <Typography variant="caption" fontWeight={600}>
              {r.wtPercent}% ({fmtMin(r.prodMin)})
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant="caption" color="text.secondary">Nao Produtivo:</Typography>
            <Typography variant="caption" fontWeight={600}>
              {100 - r.wtPercent}% ({fmtMin(r.nonProdMin)})
            </Typography>
          </Stack>
          {r.overtimeMin > 0 && (
            <>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="caption" fontWeight={600} sx={{ color: '#1D4ED8' }}>
                  Hora Extra:
                </Typography>
                <Typography variant="caption" fontWeight={600} sx={{ color: '#1D4ED8' }}>
                  +{fmtMin(r.overtimeMin)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ pl: 1 }}>
                <Typography variant="caption" sx={{ color: '#2563EB' }}>
                  Produtiva:
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {fmtMin(r.overtimeProdMin)}
                  {r.overtimeMin > 0
                    ? ` (${Math.round((r.overtimeProdMin / r.overtimeMin) * 100)}%)`
                    : ''}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ pl: 1 }}>
                <Typography variant="caption" sx={{ color: '#DC2626' }}>
                  Nao Produtiva:
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {fmtMin(r.overtimeNonProdMin)}
                  {r.overtimeMin > 0
                    ? ` (${Math.round((r.overtimeNonProdMin / r.overtimeMin) * 100)}%)`
                    : ''}
                </Typography>
              </Stack>
            </>
          )}
          <Stack direction="row" justifyContent="space-between" spacing={2}
            sx={{ pt: 0.5, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" fontWeight={600}>Trabalhado / Jornada:</Typography>
            <Typography variant="caption" fontWeight={600}>
              {fmtMin(r.totalMin)} / {fmtMin(r.expectedMin)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    );
  };

  const barClick = onBarClick ? (_: unknown, idx: number) => {
    const d = chartData[idx];
    if (d) onBarClick(d.date);
  } : undefined;
  const cursor = onBarClick ? 'pointer' : undefined;

  return (
    <ChartContainer
      title="Wrench Time Diario"
      subtitle={`Media WT: ${avgWtPercent}% | <35% Critico, 35-50% Na Faixa, >50% Excelente`}
      height={isMobile ? 210 : 280}
      isLoading={isLoading}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="dayLabel" interval={0} tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} width={36} domain={[0, 'auto']}
            tickFormatter={(v: number) => `${v}%`} />
          <ReferenceLine y={100} stroke="#78716C" strokeDasharray="4 4" strokeWidth={1.5}
            label={{ value: 'Jornada 100%', position: 'insideTopRight', fontSize: 9,
              fill: '#78716C' }} />
          <Tooltip content={renderTooltip as never} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="prodPctBar" name="Produtivo" stackId="stack"
            fill="#16A34A" fillOpacity={0.75} maxBarSize={32}
            cursor={cursor} onClick={barClick}
          />
          <Bar dataKey="nonProdPctBar" name="Nao Produtivo" stackId="stack"
            fill="#94A3B8" fillOpacity={0.6} maxBarSize={32}
            cursor={cursor} onClick={barClick}
          />
          <Bar dataKey="hexProdPctBar" name="HE Produtiva" stackId="stack"
            fill="#2563EB" fillOpacity={0.8} maxBarSize={32}
            cursor={cursor} onClick={barClick}
          />
          <Bar dataKey="hexNonProdPctBar" name="HE Nao Prod" stackId="stack"
            fill="#DC2626" fillOpacity={0.7} maxBarSize={32} radius={[3, 3, 0, 0]}
            cursor={cursor} onClick={barClick}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
