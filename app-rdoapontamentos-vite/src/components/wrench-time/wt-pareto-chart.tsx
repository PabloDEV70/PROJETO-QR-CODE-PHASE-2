import { useMemo } from 'react';
import {
  Bar, Cell, ComposedChart, Line, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { Paper, Typography } from '@mui/material';
import { ChartContainer } from '@/components/charts/chart-container';
import type { WrenchTimeBreakdown } from '@/types/wrench-time-types';
import { fmtMin } from '@/utils/wrench-time-categories';

interface WtParetoChartProps {
  breakdowns: WrenchTimeBreakdown[];
  isLoading?: boolean;
}

interface ParetoBar {
  label: string;
  totalMin: number;
  color: string;
  cumPercent: number;
}

function ParetoTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: ParetoBar; dataKey: string; value: number }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]!.payload;
  return (
    <Paper elevation={3} sx={{ p: 1.5 }}>
      <Typography variant="body2" fontWeight={600}>{d.label}</Typography>
      <Typography variant="body2" color="text.secondary">{fmtMin(d.totalMin)}</Typography>
      <Typography variant="body2" color="text.secondary">
        Acumulado: {d.cumPercent}%
      </Typography>
    </Paper>
  );
}

export function WtParetoChart({ breakdowns, isLoading }: WtParetoChartProps) {
  const data = useMemo((): ParetoBar[] => {
    const losses = breakdowns
      .filter((b) => b.category !== 'wrenchTime' && b.totalMin > 0)
      .sort((a, b) => b.totalMin - a.totalMin);
    const totalLoss = losses.reduce((s, l) => s + l.totalMin, 0);
    let cum = 0;
    return losses.map((l) => {
      cum += l.totalMin;
      return {
        label: l.label,
        totalMin: l.totalMin,
        color: l.color,
        cumPercent: totalLoss > 0 ? Math.round((cum / totalLoss) * 100) : 0,
      };
    });
  }, [breakdowns]);

  return (
    <ChartContainer title="Pareto de Perdas (80/20)" height={320} isLoading={isLoading}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} barCategoryGap="15%">
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="min" tickFormatter={(v: number) => fmtMin(v)} width={60} />
          <YAxis yAxisId="pct" orientation="right" domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`} width={45} />
          <Tooltip content={<ParetoTooltip />} />
          <ReferenceLine yAxisId="pct" y={80} stroke="#EF4444" strokeDasharray="6 3"
            label={{ value: '80%', position: 'right', fontSize: 11, fill: '#EF4444' }} />
          <Bar yAxisId="min" dataKey="totalMin" radius={[4, 4, 0, 0]}
            fill="#8884d8" name="Tempo">
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
          <Line yAxisId="pct" type="monotone" dataKey="cumPercent"
            stroke="#333" strokeWidth={2} dot={{ r: 4 }} name="% Acumulado" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
