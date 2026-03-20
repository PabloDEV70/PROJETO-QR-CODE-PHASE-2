import { useMemo } from 'react';
import {
  Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { Paper, Typography } from '@mui/material';
import { ChartContainer } from '@/components/charts/chart-container';
import type { AcademicTierResult } from '@/utils/wrench-time-academic';
import { fmtMin } from '@/utils/wrench-time-categories';

interface WtWaterfallChartProps {
  tiers: AcademicTierResult[];
  totalMin: number;
  isLoading?: boolean;
}

interface WfBar {
  name: string;
  value: number;
  invisible: number;
  color: string;
  displayValue: number;
}

function WfTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: WfBar }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]!.payload;
  return (
    <Paper elevation={3} sx={{ p: 1.5 }}>
      <Typography variant="body2" fontWeight={600}>{d.name}</Typography>
      <Typography variant="body2" color="text.secondary">{fmtMin(d.displayValue)}</Typography>
    </Paper>
  );
}

export function WtWaterfallChart({ tiers, totalMin, isLoading }: WtWaterfallChartProps) {
  const data = useMemo((): WfBar[] => {
    if (totalMin <= 0) return [];
    const desnec = tiers.find((t) => t.tier === 'improdDesnecessario');
    const nec = tiers.find((t) => t.tier === 'improdNecessario');
    const prod = tiers.find((t) => t.tier === 'produtivo');

    let running = totalMin;
    const bars: WfBar[] = [
      { name: 'Total Disponivel', value: totalMin, invisible: 0,
        color: '#64748B', displayValue: totalMin },
    ];

    if (desnec && desnec.totalMin > 0) {
      running -= desnec.totalMin;
      bars.push({
        name: 'Improd. Desnecessario', value: desnec.totalMin, invisible: running,
        color: '#EF4444', displayValue: desnec.totalMin,
      });
    }
    if (nec && nec.totalMin > 0) {
      running -= nec.totalMin;
      bars.push({
        name: 'Improd. Necessario', value: nec.totalMin, invisible: running,
        color: '#F59E0B', displayValue: nec.totalMin,
      });
    }
    bars.push({
      name: 'Wrench Time', value: prod?.totalMin ?? running, invisible: 0,
      color: '#16A34A', displayValue: prod?.totalMin ?? running,
    });
    return bars;
  }, [tiers, totalMin]);

  return (
    <ChartContainer title="Cascata de Tempo (Waterfall)" height={300} isLoading={isLoading}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="20%">
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v: number) => fmtMin(v)} width={60} />
          <Tooltip content={<WfTooltip />} />
          <ReferenceLine y={0} stroke="#666" />
          <Bar dataKey="invisible" stackId="wf" fill="transparent" />
          <Bar dataKey="value" stackId="wf" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
