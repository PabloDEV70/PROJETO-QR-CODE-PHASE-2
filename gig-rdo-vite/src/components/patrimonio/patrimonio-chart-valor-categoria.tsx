import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from '@/components/charts/chart-container';
import type { PatrimonioValorPorCategoria } from '@/types/patrimonio-types';

interface PatrimonioChartValorCategoriaProps {
  data: PatrimonioValorPorCategoria[] | undefined;
  isLoading: boolean;
}

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function PatrimonioChartValorCategoria({
  data,
  isLoading,
}: PatrimonioChartValorCategoriaProps) {
  return (
    <ChartContainer title="Valor por Categoria" isLoading={isLoading} height={280}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data ?? []}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            tickFormatter={(v: number) => formatBRL(v)}
          />
          <YAxis
            type="category"
            dataKey="categoria"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            width={120}
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
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          />
          <Bar dataKey="valor" fill="#1976d2" radius={[0, 4, 4, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
