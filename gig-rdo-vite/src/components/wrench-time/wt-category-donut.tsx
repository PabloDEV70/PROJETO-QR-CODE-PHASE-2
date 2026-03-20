import { Box, Divider, Stack, Typography } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer } from '@/components/charts/chart-container';
import { fmtMin } from '@/utils/wrench-time-categories';
import type { WrenchTimeBreakdown } from '@/types/wrench-time-types';

interface WtCategoryDonutProps {
  breakdowns: WrenchTimeBreakdown[];
  wrenchTimePercent: number;
  isLoading?: boolean;
}

const TT_BG = '#1e293b';
const TT_FG = '#f1f5f9';
const TT_MUTED = '#94a3b8';

function DonutTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: WrenchTimeBreakdown }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]!.payload;
  return (
    <Box sx={{
      bgcolor: TT_BG, color: TT_FG, borderRadius: 2, p: 1.5, minWidth: 200,
      boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
    }}>
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color }} />
          <Typography variant="body2" fontWeight={700} color="inherit">{d.label}</Typography>
        </Stack>
        <Typography variant="body2" color="inherit">{fmtMin(d.totalMin)}</Typography>
        <Typography variant="body2" fontWeight={600} color="inherit">
          {d.percentOfTotal}% da base efetiva
        </Typography>
        {d.motivos.length > 0 && (
          <>
            <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.15)' }} />
            {d.motivos.slice(0, 4).map((m) => (
              <Stack key={m.cod} direction="row" justifyContent="space-between">
                <Typography variant="caption" sx={{ color: TT_MUTED }}>{m.sigla}</Typography>
                <Typography variant="caption" fontWeight={600} color="inherit">
                  {fmtMin(m.totalMin)} ({m.percentOfCategory}%)
                </Typography>
              </Stack>
            ))}
            {d.motivos.length > 4 && (
              <Typography variant="caption" sx={{ color: TT_MUTED }}>
                +{d.motivos.length - 4} motivos...
              </Typography>
            )}
          </>
        )}
        {d.tips && (
          <Typography variant="caption" sx={{ color: '#93c5fd', mt: 0.5 }}>
            {d.tips}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export function WtCategoryDonut({ breakdowns, wrenchTimePercent, isLoading }: WtCategoryDonutProps) {
  const chartData = breakdowns.filter((b) => b.totalMin > 0);

  if (!isLoading && chartData.length === 0) {
    return (
      <ChartContainer title="Wrench Time por Categoria" height={300}>
        <Stack alignItems="center" justifyContent="center" sx={{ height: 250 }}>
          <Typography variant="body2" color="text.secondary">
            Sem dados para o periodo
          </Typography>
        </Stack>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Wrench Time por Categoria" height={300} isLoading={isLoading}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData} dataKey="totalMin" nameKey="label"
              cx="50%" cy="45%" innerRadius="55%" outerRadius="85%"
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.category} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{
          position: 'absolute', top: '45%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none',
        }}>
          <Typography variant="h4" fontWeight={700} color="primary.main" lineHeight={1}>
            {wrenchTimePercent}%
          </Typography>
          <Typography variant="caption" color="text.secondary">Wrench Time</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} justifyContent="center"
          sx={{ flexWrap: 'wrap', gap: 0.5, mt: -1 }}>
          {chartData.map((b) => (
            <Stack key={b.category} direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: b.color }} />
              <Typography variant="caption" color="text.secondary" noWrap>
                {b.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </ChartContainer>
  );
}
