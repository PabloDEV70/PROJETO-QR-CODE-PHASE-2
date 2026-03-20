import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from 'recharts';
import { ChartContainer } from '@/components/charts/chart-container';
import type { PatrimonioDashboardKpis } from '@/types/patrimonio-types';

interface PatrimonioChartMobilizacaoProps {
  kpis: PatrimonioDashboardKpis | undefined;
  isLoading: boolean;
}

const COLORS = ['#ff9800', '#4caf50'];

export function PatrimonioChartMobilizacao({
  kpis,
  isLoading,
}: PatrimonioChartMobilizacaoProps) {
  const chartData = kpis
    ? [
        { name: 'Mobilizados', value: kpis.mobilizados },
        { name: 'Disponiveis', value: kpis.disponiveis },
      ].filter((d) => d.value > 0)
    : [];

  const renderLabel = (entry: { name?: string; percent?: number }) =>
    `${entry.name ?? ''} ${((entry.percent ?? 0) * 100).toFixed(0)}%`;

  return (
    <ChartContainer title="Mobilizados vs Disponiveis" isLoading={isLoading} height={280}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={40}
            paddingAngle={3}
            dataKey="value"
            label={renderLabel}
            labelLine={{ strokeWidth: 1 }}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: 8,
              color: '#f1f5f9',
            }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
