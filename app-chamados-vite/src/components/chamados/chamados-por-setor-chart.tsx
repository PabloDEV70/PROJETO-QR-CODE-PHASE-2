import { Box, Typography, Skeleton, Paper, Stack, Tooltip } from '@mui/material';
import { BarChartRounded } from '@mui/icons-material';
import type { SetorResumo } from '@/types/chamados-types';

interface ChamadosPorSetorChartProps {
  setores: SetorResumo[];
  isLoading: boolean;
}

export function ChamadosPorSetorChart({ setores, isLoading }: ChamadosPorSetorChartProps) {
  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
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

  if (!setores.length) {
    return (
      <Paper elevation={0} sx={{
        p: 4, borderRadius: 3, border: '1px dashed #cbd5e1',
        textAlign: 'center', bgcolor: '#f8fafc',
      }}>
        <BarChartRounded sx={{ fontSize: 36, color: '#cbd5e1', mb: 1 }} />
        <Typography sx={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>
          Sem dados por setor
        </Typography>
      </Paper>
    );
  }

  const maxTotal = Math.max(...setores.map((s) => s.TOTAL), 1);

  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        mb: 2.5,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: 2,
            bgcolor: '#fef3c7', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <BarChartRounded sx={{ fontSize: 18, color: '#d97706' }} />
          </Box>
          <Typography sx={{
            fontSize: 14, fontWeight: 700, color: '#1e293b',
            letterSpacing: '-0.01em',
          }}>
            Chamados por Setor
          </Typography>
        </Box>

        {/* Legend */}
        <Stack direction="row" spacing={2}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: '#22c55e' }} />
            <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
              Finalizados
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: '#f59e0b' }} />
            <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
              Ativos
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Bars */}
      <Stack spacing={2}>
        {setores.map((setor) => {
          const pctFinalizados = setor.TOTAL > 0 ? (setor.FINALIZADOS / maxTotal) * 100 : 0;
          const pctAtivos = setor.TOTAL > 0 ? (setor.ATIVOS / maxTotal) * 100 : 0;

          return (
            <Box key={setor.SETOR ?? 'sem-setor'}>
              <Box sx={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'baseline', mb: 0.75,
              }}>
                <Typography sx={{
                  fontSize: 13, fontWeight: 600, color: '#1e293b',
                }}>
                  {setor.SETOR ?? 'Sem Setor'}
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography sx={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                    {setor.FINALIZADOS}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>
                    {setor.ATIVOS}
                  </Typography>
                  <Typography sx={{
                    fontSize: 12, color: '#475569', fontWeight: 700,
                    bgcolor: '#f1f5f9', px: 1, py: 0.15, borderRadius: 1,
                  }}>
                    {setor.TOTAL}
                  </Typography>
                </Stack>
              </Box>

              <Tooltip
                title={`Finalizados: ${setor.FINALIZADOS} | Ativos: ${setor.ATIVOS}`}
                placement="top"
                arrow
              >
                <Box sx={{
                  display: 'flex', height: 14, borderRadius: 2,
                  overflow: 'hidden', bgcolor: '#f1f5f9',
                  cursor: 'pointer',
                }}>
                  <Box sx={{
                    width: `${pctFinalizados}%`,
                    bgcolor: '#22c55e',
                    transition: 'width 0.5s ease',
                    borderRight: pctFinalizados > 0 && pctAtivos > 0
                      ? '1px solid rgba(255,255,255,0.5)' : 'none',
                  }} />
                  <Box sx={{
                    width: `${pctAtivos}%`,
                    bgcolor: '#f59e0b',
                    transition: 'width 0.5s ease',
                  }} />
                </Box>
              </Tooltip>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
