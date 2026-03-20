import { Box, Typography, Skeleton, Paper, Stack, Tooltip } from '@mui/material';
import { WarningRounded } from '@mui/icons-material';
import { STATUSGIG_MAP } from '@/utils/os-constants';
import type { OsResumo } from '@/types/os-types';

interface OsPorStatusGigChartProps {
  resumo: OsResumo | undefined;
  isLoading: boolean;
}

export function OsPorStatusGigChart({ resumo, isLoading }: OsPorStatusGigChartProps) {
  const items = resumo?.porStatusGig ?? [];

  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Skeleton width={180} height={24} sx={{ mb: 2 }} />
        <Stack spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i}>
              <Skeleton width="40%" height={18} sx={{ mb: 0.75 }} />
              <Skeleton variant="rounded" height={14} sx={{ borderRadius: 2 }} />
            </Box>
          ))}
        </Stack>
      </Paper>
    );
  }

  if (!items.length) {
    return (
      <Paper elevation={0} sx={{
        p: 4, borderRadius: 3, border: '1px dashed', borderColor: 'divider',
        textAlign: 'center', bgcolor: 'action.hover',
      }}>
        <WarningRounded sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
        <Typography sx={{ color: 'text.secondary', fontSize: 14, fontWeight: 500 }}>
          Sem dados por Status GIG
        </Typography>
      </Paper>
    );
  }

  const maxTotal = Math.max(...items.map((s) => s.total), 1);

  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: 2,
          bgcolor: '#fef2f2', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <WarningRounded sx={{ fontSize: 18, color: '#dc2626' }} />
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
          Status GIG (Impeditivos)
        </Typography>
        <Stack direction="row" spacing={2} sx={{ ml: 'auto' }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: '#ef4444' }} />
            <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500 }}>Impeditivo</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: '#64748b' }} />
            <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500 }}>Normal</Typography>
          </Stack>
        </Stack>
      </Box>

      <Stack spacing={2}>
        {items.map((item) => {
          const pct = (item.total / maxTotal) * 100;
          const def = STATUSGIG_MAP[item.statusGig];
          const isImp = def?.impeditivo ?? false;
          const color = isImp ? '#ef4444' : '#64748b';

          return (
            <Box key={item.statusGig}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.label}</Typography>
                  {isImp && <WarningRounded sx={{ fontSize: 12, color: '#ef4444' }} />}
                </Stack>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color }}>{item.total}</Typography>
              </Box>
              <Tooltip title={`${item.label}: ${item.total}${isImp ? ' (Impeditivo)' : ''}`} placement="top" arrow>
                <Box sx={{
                  display: 'flex', height: 14, borderRadius: 2,
                  overflow: 'hidden', bgcolor: 'action.hover', cursor: 'pointer',
                }}>
                  <Box sx={{ width: `${pct}%`, bgcolor: color, transition: 'width 0.5s ease' }} />
                </Box>
              </Tooltip>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
