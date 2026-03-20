import { useMemo } from 'react';
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
import type { PatrimonioTopCliente } from '@/types/patrimonio-types';

interface PatrimonioChartClientesProps {
  data: PatrimonioTopCliente[] | undefined;
  isLoading: boolean;
}

const truncate = (str: string, max: number) =>
  str.length > max ? `${str.slice(0, max)}...` : str;

export function PatrimonioChartClientes({
  data,
  isLoading,
}: PatrimonioChartClientesProps) {
  const chartData = useMemo(
    () => (data ?? []).map((d) => ({ ...d, clienteLabel: truncate(d.cliente, 25) })),
    [data],
  );

  return (
    <ChartContainer title="Top Clientes" isLoading={isLoading} height={280}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} />
          <YAxis
            type="category"
            dataKey="clienteLabel"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            width={160}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: 8,
              color: '#f1f5f9',
            }}
            labelStyle={{ color: '#f1f5f9', fontWeight: 700 }}
            itemStyle={{ color: '#f1f5f9' }}
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            labelFormatter={(_: unknown, payload: ReadonlyArray<{ payload?: { cliente: string } }>) =>
              payload[0]?.payload?.cliente ?? ''
            }
          />
          <Bar dataKey="veiculos" fill="#d32f2f" radius={[0, 4, 4, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
