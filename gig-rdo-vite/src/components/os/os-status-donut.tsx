import { Box, Stack, Typography } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer } from '@/components/charts/chart-container';
import type { OsDashboardKpis } from '@/types/os-dashboard-types';

interface OsStatusDonutProps {
  statusDistribution: OsDashboardKpis['statusDistribution'] | undefined;
  isLoading: boolean;
}

const TT_BG = '#1e293b';
const TT_FG = '#f1f5f9';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

function StatusTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: ChartDataItem }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]!.payload;
  const total = payload[0]!.payload.value;

  return (
    <Box sx={{
      bgcolor: TT_BG, color: TT_FG, borderRadius: 2, p: 1.5,
      boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
    }}>
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color }} />
          <Typography variant="body2" fontWeight={700} color="inherit">
            {d.name}
          </Typography>
        </Stack>
        <Typography variant="body2" color="inherit">
          {total} OS
        </Typography>
      </Stack>
    </Box>
  );
}

export function OsStatusDonut({ statusDistribution, isLoading }: OsStatusDonutProps) {
  const chartData: ChartDataItem[] = statusDistribution
    ? [
        { name: 'Aberta', value: statusDistribution.aberta, color: '#EF4444' },
        { name: 'Em Execucao', value: statusDistribution.emExecucao, color: '#F59E0B' },
        { name: 'Finalizada', value: statusDistribution.finalizada, color: '#16A34A' },
        { name: 'Cancelada', value: statusDistribution.cancelada, color: '#94A3B8' },
      ].filter((d) => d.value > 0)
    : [];

  const totalOS = chartData.reduce((acc, d) => acc + d.value, 0);
  const completionRate = totalOS > 0
    ? Math.round((statusDistribution?.finalizada ?? 0) / totalOS * 100)
    : 0;

  if (!isLoading && chartData.length === 0) {
    return (
      <ChartContainer title="Distribuicao por Status" height={300}>
        <Stack alignItems="center" justifyContent="center" sx={{ height: 250 }}>
          <Typography variant="body2" color="text.secondary">
            Sem dados
          </Typography>
        </Stack>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Distribuicao por Status" height={300} isLoading={isLoading}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData} dataKey="value" nameKey="name"
              cx="50%" cy="45%" innerRadius="55%" outerRadius="85%"
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<StatusTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{
          position: 'absolute', top: '45%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none',
        }}>
          <Typography variant="h4" fontWeight={700} color="success.main" lineHeight={1}>
            {completionRate}%
          </Typography>
          <Typography variant="caption" color="text.secondary">Concluidas</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} justifyContent="center"
          sx={{ flexWrap: 'wrap', gap: 0.5, mt: -1 }}>
          {chartData.map((d) => (
            <Stack key={d.name} direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: d.color }} />
              <Typography variant="caption" color="text.secondary" noWrap>
                {d.name}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </ChartContainer>
  );
}
