import { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { ChartContainer } from '@/components/charts/chart-container';
import type { RdoAnalyticsMotivo } from '@/types/rdo-analytics-types';

const COLORS = [
  '#1976d2',
  '#2e7d32',
  '#ed6c02',
  '#7b1fa2',
  '#0288d1',
  '#558b2f',
  '#c62828',
  '#6a1b9a',
  '#00838f',
  '#ef6c00',
];

interface MotivosPieChartProps {
  data?: RdoAnalyticsMotivo[];
  isLoading: boolean;
}

export const MotivosPieChart = ({ data, isLoading }: MotivosPieChartProps) => {
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      name: item.sigla || item.descricao,
      value: Number(item.totalHoras.toFixed(1)),
      descricao: item.descricao,
      percentual: item.percentualDoTotal,
    }));
  }, [data]);

  const renderLabel = (entry: any) => {
    return `${entry.name} ${entry.percentual.toFixed(1)}%`;
  };

  return (
    <ChartContainer
      title="Distribuicao por Motivo"
      subtitle="Horas por categoria"
      isLoading={isLoading}
    >
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={45}
            paddingAngle={2}
            dataKey="value"
            label={renderLabel}
            labelLine={{ strokeWidth: 1 }}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]!}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value}h`}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
