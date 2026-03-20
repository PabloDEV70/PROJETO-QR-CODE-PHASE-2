import { Box, Divider, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { fmtMin } from '@/utils/wrench-time-categories';
import type { RdoListItem } from '@/types/rdo-types';

interface RdoProdPieProps {
  metricas: RdoListItem;
  isLoading?: boolean;
}

interface SliceData {
  name: string;
  value: number;
  color: string;
  percent: number;
}

function PieTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: SliceData }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]!.payload;
  return (
    <Paper elevation={3} sx={{ p: 1.5, minWidth: 140, bgcolor: 'background.paper' }}>
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color }} />
          <Typography variant="body2" fontWeight={600}>{d.name}</Typography>
        </Stack>
        <Divider />
        <Typography variant="body2">{fmtMin(d.value)}</Typography>
        <Typography variant="caption" color="text.secondary">{d.percent}%</Typography>
      </Stack>
    </Paper>
  );
}

export function RdoProdPie({ metricas: m, isLoading }: RdoProdPieProps) {
  if (isLoading) return <Skeleton variant="rounded" height={260} sx={{ mt: 2 }} />;

  const rawCats = m.wtCategorias ?? [];
  const slices = [...rawCats]
    .sort((a, b) => a.categoria === 'wrenchTime' ? -1 : b.categoria === 'wrenchTime' ? 1 : b.minutos - a.minutos)
    .map((c) => ({ name: c.label, value: c.minutos, color: c.color, percent: c.percent }));

  if (slices.length === 0) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: 120, mt: 2 }}>
        <Typography variant="body2" color="text.secondary">Sem apontamentos</Typography>
      </Stack>
    );
  }

  const pct = m.produtividadePercent ?? 0;
  const pctColor = m.diagnosticoFaixa?.faixa.color
    ?? (pct >= 95 ? '#16A34A' : pct >= 85 ? '#F59E0B' : pct >= 70 ? '#F97316' : '#EF4444');

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
        Distribuicao do Tempo
      </Typography>
      <Box sx={{ position: 'relative', width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices} dataKey="value" nameKey="name"
              cx="50%" cy="45%" innerRadius="55%" outerRadius="85%"
              paddingAngle={2} startAngle={90} endAngle={-270}
            >
              {slices.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{
          position: 'absolute', top: '45%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none',
        }}>
          <Typography variant="h4" fontWeight={700} color={pctColor} lineHeight={1}>
            {pct}%
          </Typography>
          <Typography variant="caption" color="text.secondary">produtividade</Typography>
        </Box>
      </Box>
      {/* Legend */}
      <Stack direction="row" flexWrap="wrap" gap={1.5} justifyContent="center" sx={{ mt: 0.5 }}>
        {slices.map((s) => (
          <Stack key={s.name} direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
            <Typography variant="caption" color="text.secondary">
              {s.name} {s.percent}%
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
