import { Grid, Paper, Stack, Typography, Skeleton } from '@mui/material';
import { ViewList, People, Group, Warning } from '@mui/icons-material';
import type { PermissoesResumo } from '@/types/permissoes-types';

interface Props {
  resumo?: PermissoesResumo;
  isLoading: boolean;
}

const cards = [
  { key: 'telas', label: 'Telas', field: 'totalTelas' as const, icon: <ViewList />, color: '#1976d2', bg: 'rgba(25,118,210,0.08)' },
  { key: 'usuarios', label: 'Usuarios', field: 'totalUsuarios' as const, icon: <People />, color: '#2e7d32', bg: 'rgba(46,125,50,0.08)' },
  { key: 'grupos', label: 'Grupos', field: 'totalGrupos' as const, icon: <Group />, color: '#ed6c02', bg: 'rgba(237,108,2,0.08)' },
  { key: 'atrib', label: 'Atribuicoes', field: 'totalAtribuicoes' as const, icon: <Warning />, color: '#9c27b0', bg: 'rgba(156,39,176,0.08)' },
];

export function PermissoesKpiCards({ resumo, isLoading }: Props) {
  if (isLoading || !resumo) {
    return (
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, sm: 3 }}>
            <Skeleton variant="rounded" height={80} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {cards.map((c) => (
        <Grid key={c.key} size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ px: 2, py: 1.5, borderRadius: 2.5 }}>
            <Stack spacing={0.5}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontSize: '0.6875rem', lineHeight: 1.2 }}
              >
                {c.label}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Stack
                  sx={{
                    display: 'flex',
                    p: 0.75,
                    borderRadius: 1.5,
                    bgcolor: c.bg,
                    color: c.color,
                  }}
                >
                  {c.icon}
                </Stack>
                <Typography variant="h5" fontWeight={700} lineHeight={1}>
                  {resumo[c.field].toLocaleString('pt-BR')}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
