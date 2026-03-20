import { Box, Typography, LinearProgress, Skeleton, Paper, Stack } from '@mui/material';
import type { SetorResumo } from '@/types/chamados-types';

interface ChamadosPorSetorChartProps {
  setores: SetorResumo[];
  isLoading: boolean;
}

export function ChamadosPorSetorChart({ setores, isLoading }: ChamadosPorSetorChartProps) {
  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Box key={i}>
            <Skeleton width="30%" height={16} />
            <Skeleton height={24} />
          </Box>
        ))}
      </Stack>
    );
  }

  if (!setores.length) {
    return <Typography color="text.secondary">Sem dados por setor.</Typography>;
  }

  const maxTotal = Math.max(...setores.map((s) => s.TOTAL), 1);

  return (
    <Stack spacing={1.5}>
      {setores.map((setor) => {
        const pct = Math.round((setor.TOTAL / maxTotal) * 100);
        const pctAtivos = setor.TOTAL > 0 ? Math.round((setor.ATIVOS / setor.TOTAL) * 100) : 0;

        return (
          <Paper key={setor.SETOR ?? 'sem-setor'} variant="outlined" sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" fontWeight={500}>
                {setor.SETOR ?? 'Sem Setor'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {setor.TOTAL} total
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{ height: 8, borderRadius: 4, mb: 0.75 }}
              color="primary"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="caption" color="success.main">
                Finalizados: {setor.FINALIZADOS}
              </Typography>
              <Typography variant="caption" color="warning.main">
                Ativos: {setor.ATIVOS} ({pctAtivos}%)
              </Typography>
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
}
