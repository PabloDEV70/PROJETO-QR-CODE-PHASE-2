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
import type { PatrimonioIdadeFrota } from '@/types/patrimonio-types';

interface PatrimonioChartIdadeProps {
  data: PatrimonioIdadeFrota[] | undefined;
  isLoading: boolean;
}

export function PatrimonioChartIdade({
  data,
  isLoading,
}: PatrimonioChartIdadeProps) {
  return (
    <ChartContainer title="Idade do Patrimonio (por data de compra)" isLoading={isLoading} height={280}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data ?? []}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis dataKey="faixa" tick={{ fontSize: 11, fill: '#94A3B8' }} />
          <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
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
          />
          <Bar dataKey="quantidade" fill="#7b1fa2" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
