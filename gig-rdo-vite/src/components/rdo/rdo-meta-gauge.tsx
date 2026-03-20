import { useMemo } from 'react';
import { Paper, Typography, Box, Skeleton, Tooltip } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { ProductivityResult } from '@/utils/motivo-productivity';
import { fmtMin } from './rdo-kpi-helpers';

interface Props {
  productivity: ProductivityResult | undefined;
  isLoading: boolean;
}

function getColor(pct: number): string {
  if (pct >= 90) return '#16A34A';
  if (pct >= 70) return '#F59E0B';
  return '#d32f2f';
}

export function RdoMetaGauge({ productivity, isLoading }: Props) {
  const pct = productivity?.prodVsMetaPercent ?? 0;
  const color = getColor(pct);

  const data = useMemo(() => [
    { value: Math.min(pct, 100) },
    { value: Math.max(100 - pct, 0) },
  ], [pct]);

  if (isLoading) {
    return <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2.5 }} />;
  }

  if (!productivity?.totalMetaEfetivaMin) return null;

  const realH = (productivity.totalProdMin / 60).toFixed(1);
  const metaH = (productivity.totalMetaEfetivaMin / 60).toFixed(1);

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2.5, textAlign: 'center' }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Realizacao vs Meta
      </Typography>
      <Box sx={{ height: 110, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data} dataKey="value"
              cx="50%" cy="90%"
              startAngle={180} endAngle={0}
              innerRadius="65%" outerRadius="95%"
              paddingAngle={0}
            >
              <Cell fill={color} />
              <Cell fill="rgba(0,0,0,0.06)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{
          position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
        }}>
          <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1 }}>
            {pct}%
          </Typography>
        </Box>
      </Box>
      <Tooltip
        title={`Produtivo: ${fmtMin(productivity.totalProdMin)}\nMeta efetiva: ${fmtMin(productivity.totalMetaEfetivaMin)}`}
        arrow
      >
        <Typography variant="caption" color="text.secondary">
          Meta: {metaH}h | Real: {realH}h
        </Typography>
      </Tooltip>
    </Paper>
  );
}
