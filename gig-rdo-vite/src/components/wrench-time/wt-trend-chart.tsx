import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceArea, Legend,
} from 'recharts';
import { Typography, Stack, useTheme, useMediaQuery } from '@mui/material';
import { ChartContainer } from '@/components/charts/chart-container';
import { fmtMin } from '@/utils/wrench-time-categories';

interface TrendPoint {
  date: string;
  label: string;
  wtPercent: number;
  prodMin: number;
  nonProdMin: number;
  totalMin: number;
  ma7: number | null;
}

interface WtTrendChartProps {
  data: TrendPoint[];
  isLoading?: boolean;
}

function TrendTooltip({ active, payload }: {
  active?: boolean; payload?: readonly { payload: TrendPoint }[];
}) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Stack sx={{
      bgcolor: 'background.paper', border: 1, borderColor: 'divider',
      borderRadius: 1, p: 1.5, boxShadow: 2, minWidth: 180,
    }} spacing={0.25}>
      <Typography variant="caption" fontWeight={600}>
        {`${d.date.slice(8, 10)}/${d.date.slice(5, 7)}/${d.date.slice(0, 4)}`}
      </Typography>
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Typography variant="caption" sx={{ color: '#16A34A' }}>WT%:</Typography>
        <Typography variant="caption" fontWeight={600}>{d.wtPercent}%</Typography>
      </Stack>
      {d.ma7 != null && (
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Typography variant="caption" sx={{ color: '#3B82F6' }}>Media 7d:</Typography>
          <Typography variant="caption" fontWeight={600}>{d.ma7}%</Typography>
        </Stack>
      )}
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Typography variant="caption" color="text.secondary">Produtivo:</Typography>
        <Typography variant="caption" fontWeight={600}>{fmtMin(d.prodMin)}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Typography variant="caption" color="text.secondary">Total:</Typography>
        <Typography variant="caption" fontWeight={600}>{fmtMin(d.totalMin)}</Typography>
      </Stack>
    </Stack>
  );
}

export function WtTrendChart({ data, isLoading }: WtTrendChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!isLoading && data.length === 0) {
    return (
      <ChartContainer title="Tendencia Wrench Time" height={280}>
        <Stack alignItems="center" justifyContent="center" sx={{ height: 230 }}>
          <Typography variant="body2" color="text.secondary">
            Sem dados para o periodo
          </Typography>
        </Stack>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Tendencia Wrench Time" height={isMobile ? 210 : 280} isLoading={isLoading}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="wtGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16A34A" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#16A34A" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="label" interval="preserveStartEnd" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }}
            tickFormatter={(v: number) => `${v}%`} />
          <Tooltip content={<TrendTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <ReferenceArea y1={35} y2={50} fill="#16A34A" fillOpacity={0.06}
            label={{ value: 'Zona Saudavel', position: 'insideTop', fontSize: 10,
              fill: theme.palette.text.secondary }} />
          <Area type="monotone" dataKey="wtPercent" name="WT%"
            fill="url(#wtGrad)" stroke="#16A34A" strokeWidth={2} />
          <Line type="monotone" dataKey="ma7" name="Media 7d"
            stroke="#3B82F6" strokeWidth={2} strokeDasharray="6 3" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
