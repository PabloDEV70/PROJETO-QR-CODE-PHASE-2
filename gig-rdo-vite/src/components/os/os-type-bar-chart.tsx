import { Box, Stack, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartContainer } from '@/components/charts/chart-container';
import type { OsDashboardKpis } from '@/types/os-dashboard-types';

interface OsTypeBarChartProps {
  typeDistribution: OsDashboardKpis['typeDistribution'] | undefined;
  isLoading: boolean;
}

const TT_BG = '#1e293b';
const TT_FG = '#f1f5f9';

interface ChartDataItem {
  type: string;
  value: number;
  color: string;
}

function TypeTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: ChartDataItem }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]!.payload;

  return (
    <Box sx={{
      bgcolor: TT_BG, color: TT_FG, borderRadius: 2, p: 1.5,
      boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
    }}>
      <Stack spacing={0.5}>
        <Typography variant="body2" fontWeight={700} color="inherit">
          {d.type}
        </Typography>
        <Typography variant="body2" color="inherit">
          {d.value} OS
        </Typography>
      </Stack>
    </Box>
  );
}

export function OsTypeBarChart({ typeDistribution, isLoading }: OsTypeBarChartProps) {
  const chartData: ChartDataItem[] = typeDistribution
    ? [
        { type: 'Corretiva', value: typeDistribution.corretiva, color: '#EF4444' },
        { type: 'Preventiva', value: typeDistribution.preventiva, color: '#16A34A' },
        { type: 'Outros', value: typeDistribution.outros, color: '#94A3B8' },
      ].filter((d) => d.value > 0)
    : [];

  if (!isLoading && chartData.length === 0) {
    return (
      <ChartContainer title="Distribuicao por Tipo de Manutencao" height={300}>
        <Stack alignItems="center" justifyContent="center" sx={{ height: 250 }}>
          <Typography variant="body2" color="text.secondary">
            Sem dados
          </Typography>
        </Stack>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Distribuicao por Tipo de Manutencao" height={300} isLoading={isLoading}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 10 }} width={40} />
          <Tooltip content={<TypeTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={80}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
