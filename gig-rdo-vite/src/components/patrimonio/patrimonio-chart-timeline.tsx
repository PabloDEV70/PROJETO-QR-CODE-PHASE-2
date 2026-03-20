import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from '@/components/charts/chart-container';
import type { PatrimonioTimelineAquisicao } from '@/types/patrimonio-types';

interface PatrimonioChartTimelineProps {
  data: PatrimonioTimelineAquisicao[] | undefined;
  isLoading: boolean;
}

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function PatrimonioChartTimeline({
  data,
  isLoading,
}: PatrimonioChartTimelineProps) {
  return (
    <ChartContainer title="Timeline de Aquisicoes" isLoading={isLoading} height={280}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data ?? []}
          margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} />
          <YAxis
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            tickFormatter={(v: number) => formatBRL(v)}
          />
          <Tooltip
            formatter={(value: number | undefined) => formatBRL(value ?? 0)}
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: 8,
              color: '#f1f5f9',
            }}
            labelStyle={{ color: '#f1f5f9', fontWeight: 700 }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Area
            type="monotone"
            dataKey="valorAcumulado"
            stroke="#1976d2"
            fill="#1976d2"
            fillOpacity={0.3}
            name="Valor Acumulado"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
