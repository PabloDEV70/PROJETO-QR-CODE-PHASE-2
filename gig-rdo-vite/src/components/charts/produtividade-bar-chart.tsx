import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from '@/components/charts/chart-container';
import type { RdoAnalyticsProdutividade } from '@/types/rdo-analytics-types';

interface ProdutividadeBarChartProps {
  data?: RdoAnalyticsProdutividade[];
  isLoading: boolean;
}

interface ChartData {
  name: string;
  Horas: number;
  RDOs: number;
}

export function ProdutividadeBarChart({ data, isLoading }: ProdutividadeBarChartProps) {
  const theme = useTheme();

  const chartData = useMemo<ChartData[]>(() => {
    if (!data || data.length === 0) return [];

    return data.slice(0, 15).map((item) => {
      const words = item.nomeparc?.trim().split(/\s+/) ?? [];
      const name = words.length >= 2
        ? `${words[0]} ${words[1]}`
        : words[0] ?? `#${item.codparc}`;

      return {
        name,
        Horas: Number(item.totalHoras.toFixed(1)),
        RDOs: item.totalRdos,
      };
    });
  }, [data]);

  return (
    <ChartContainer
      title="Top Colaboradores"
      subtitle="Horas trabalhadas"
      isLoading={isLoading}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, bottom: 5, left: 80 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.palette.divider}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            width={75}
          />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="Horas"
            fill="#1976d2"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
