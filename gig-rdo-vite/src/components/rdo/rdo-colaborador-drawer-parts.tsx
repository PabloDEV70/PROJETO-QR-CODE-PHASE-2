import {
  Box, Typography, Stack, LinearProgress, Skeleton,
} from '@mui/material';
import { AreaChart, Area, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';
import { fmtMin } from './rdo-kpi-helpers';

interface MotivoBar {
  cod: number;
  sigla: string;
  totalMin: number;
  category: string;
}

export function KpiRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={700}>{value}</Typography>
    </Stack>
  );
}

export function MotivosBars({
  groups, isLoading, hoverColor,
}: {
  groups: MotivoBar[];
  isLoading: boolean;
  hoverColor: string;
}) {
  if (isLoading) return <Skeleton variant="rounded" height={100} />;

  const total = groups.reduce((s, x) => s + x.totalMin, 0);

  return (
    <Stack spacing={0.75} sx={{ mb: 2 }}>
      {groups.slice(0, 6).map((g) => {
        const pct = total > 0 ? (g.totalMin / total) * 100 : 0;
        return (
          <Stack key={g.cod} direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" sx={{ width: 50, fontWeight: 600 }}>
              {g.sigla}
            </Typography>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate" value={pct}
                sx={{
                  height: 8, borderRadius: 4,
                  bgcolor: hoverColor,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: g.category === 'PRODUTIVO' ? '#16A34A' : '#F59E0B',
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary"
              sx={{ width: 60, textAlign: 'right' }}>
              {pct.toFixed(0)}% {fmtMin(g.totalMin)}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

interface SparkPoint { dt: string; h: number }

export function SparklineSection({
  data, isLoading,
}: {
  data: SparkPoint[];
  isLoading: boolean;
}) {
  if (isLoading) return <Skeleton variant="rounded" height={60} />;

  if (data.length <= 1) {
    return (
      <Typography variant="caption" color="text.secondary">
        Dados insuficientes para sparkline
      </Typography>
    );
  }

  return (
    <Box sx={{ height: 60, mb: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone" dataKey="h" stroke="#3B82F6"
            fill="url(#sparkGrad)" strokeWidth={2} dot={false}
          />
          <ReTooltip
            formatter={(v) => [`${Number(v ?? 0).toFixed(1)}h`, 'Horas']}
            labelFormatter={(l) => String(l)}
            contentStyle={{ fontSize: 11 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
