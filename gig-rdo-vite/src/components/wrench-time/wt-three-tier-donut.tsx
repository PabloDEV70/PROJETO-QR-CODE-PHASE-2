import { Box, Paper, Stack, Typography } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer } from '@/components/charts/chart-container';
import type { AcademicTierResult } from '@/utils/wrench-time-academic';
import { fmtMin } from '@/utils/wrench-time-categories';

interface WtThreeTierDonutProps {
  tiers: AcademicTierResult[];
  wrenchTimePercent: number;
  isLoading?: boolean;
}

function TierTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: AcademicTierResult }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]!.payload;
  return (
    <Paper elevation={3} sx={{ p: 1.5, minWidth: 160 }}>
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color }} />
          <Typography variant="body2" fontWeight={600}>{d.label}</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">{fmtMin(d.totalMin)}</Typography>
        <Typography variant="body2" color="text.secondary">{d.percentOfTotal}% do total</Typography>
      </Stack>
    </Paper>
  );
}

export function WtThreeTierDonut({ tiers, wrenchTimePercent, isLoading }: WtThreeTierDonutProps) {
  const chartData = tiers.filter((t) => t.totalMin > 0);

  return (
    <ChartContainer title="Classificacao Academica (3 Niveis)" height={300} isLoading={isLoading}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData} dataKey="totalMin" nameKey="label"
              cx="50%" cy="45%" innerRadius="55%" outerRadius="85%" paddingAngle={3}
            >
              {chartData.map((t) => <Cell key={t.tier} fill={t.color} />)}
            </Pie>
            <Tooltip content={<TierTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{
          position: 'absolute', top: '45%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none',
        }}>
          <Typography variant="h4" fontWeight={700} color="#16A34A" lineHeight={1}>
            {wrenchTimePercent}%
          </Typography>
          <Typography variant="caption" color="text.secondary">Produtivo</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} justifyContent="center"
          sx={{ flexWrap: 'wrap', gap: 0.5, mt: -1 }}>
          {tiers.map((t) => (
            <Stack key={t.tier} direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: t.color }} />
              <Typography variant="caption" color="text.secondary" noWrap>
                {t.label} ({t.percentOfTotal}%)
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </ChartContainer>
  );
}
