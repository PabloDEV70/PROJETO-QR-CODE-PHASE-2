import { Box, Typography, Skeleton, Paper, Stack, Tooltip } from '@mui/material';
import { BarChartRounded } from '@mui/icons-material';
import { TIPO_MANUT_MAP } from '@/utils/os-constants';
import type { OsResumo } from '@/types/os-types';

interface OsPorTipoChartProps {
  resumo: OsResumo | undefined;
  isLoading: boolean;
}

export function OsPorTipoChart({ resumo, isLoading }: OsPorTipoChartProps) {
  const tipos = resumo?.porTipo ?? [];

  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Skeleton width={180} height={24} sx={{ mb: 2 }} />
        <Stack spacing={2}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Box key={i}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Skeleton width="30%" height={18} />
                <Skeleton width={50} height={18} />
              </Box>
              <Skeleton variant="rounded" height={14} sx={{ borderRadius: 2 }} />
            </Box>
          ))}
        </Stack>
      </Paper>
    );
  }

  if (!tipos.length) {
    return (
      <Paper elevation={0} sx={{
        p: 4, borderRadius: 3, border: '1px dashed', borderColor: 'divider',
        textAlign: 'center', bgcolor: 'action.hover',
      }}>
        <BarChartRounded sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
        <Typography sx={{ color: 'text.secondary', fontSize: 14, fontWeight: 500 }}>
          Sem dados por tipo
        </Typography>
      </Paper>
    );
  }

  const maxTotal = Math.max(...tipos.map((t) => t.total), 1);

  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: 2,
          bgcolor: '#e0f2fe', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <BarChartRounded sx={{ fontSize: 18, color: '#0284c7' }} />
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
          OS por Tipo Manutencao
        </Typography>
      </Box>

      <Stack spacing={2}>
        {tipos.map((tipo) => {
          const pct = (tipo.total / maxTotal) * 100;
          const def = TIPO_MANUT_MAP[tipo.tipo];
          const color = def?.color ?? '#64748b';

          return (
            <Box key={tipo.tipo}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{tipo.label}</Typography>
                <Typography sx={{
                  fontSize: 12, fontWeight: 700, color,
                  bgcolor: `${color}14`, px: 1, py: 0.15, borderRadius: 1,
                }}>
                  {tipo.total}
                </Typography>
              </Box>
              <Tooltip title={`${tipo.label}: ${tipo.total}`} placement="top" arrow>
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
