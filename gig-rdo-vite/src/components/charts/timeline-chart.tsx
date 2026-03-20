import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartContainer } from '@/components/charts/chart-container';
import type { RdoTimelinePoint } from '@/types/rdo-analytics-types';

interface TimelineChartProps {
  data?: RdoTimelinePoint[];
  isLoading: boolean;
}

export const TimelineChart = ({ data, isLoading }: TimelineChartProps) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((point) => {
      const dateObj = new Date(point.DTREF);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');

      return {
        date: `${day}/${month}`,
        Horas: Number(point.totalHoras.toFixed(1)),
        Colaboradores: point.totalColaboradores,
      };
    });
  }, [data]);

  return (
    <ChartContainer
      title="Timeline"
      subtitle="Horas e colaboradores por dia"
      isLoading={isLoading}
    >
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0,0,0,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94A3B8' }}
          />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="Horas"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.12}
          />
          <Area
            type="monotone"
            dataKey="Colaboradores"
            stroke="#16A34A"
            fill="#16A34A"
            fillOpacity={0.08}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
