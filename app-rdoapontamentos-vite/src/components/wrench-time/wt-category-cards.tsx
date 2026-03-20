import { Box, Chip, Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { fmtMin } from '@/utils/wrench-time-categories';
import type { WrenchTimeBreakdown, WrenchTimeCategory } from '@/types/wrench-time-types';

interface WtCategoryCardsProps {
  breakdowns: WrenchTimeBreakdown[];
  isLoading?: boolean;
  onCategoryClick?: (category: WrenchTimeCategory) => void;
}

export function WtCategoryCards({
  breakdowns,
  isLoading = false,
  onCategoryClick,
}: WtCategoryCardsProps) {
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 7 }).map((_, idx) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={idx}>
            <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2.5 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (breakdowns.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Nenhuma categoria disponivel
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {breakdowns.map((b) => (
        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={b.category}>
          <Paper
            data-hoverable
            onClick={() => onCategoryClick?.(b.category)}
            sx={{
              p: 2,
              cursor: onCategoryClick ? 'pointer' : 'default',
              borderRadius: 2.5,
              borderLeft: 4,
              borderLeftColor: b.color,
              transition: 'box-shadow 0.2s ease-in-out',
              '&:hover': onCategoryClick
                ? {
                    boxShadow: 4,
                  }
                : undefined,
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{
                fontSize: '0.6875rem',
                display: 'block',
                lineHeight: 1.2,
              }}
            >
              {b.label}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                color: b.color,
                mt: 0.5,
                mb: 0.25,
              }}
            >
              {fmtMin(b.totalMin)}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {b.percentOfTotal}% do total
            </Typography>

            {b.motivos.length > 0 && (
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  mt: 1,
                  flexWrap: 'wrap',
                  gap: 0.5,
                }}
              >
                {b.motivos.slice(0, 3).map((m) => (
                  <Chip
                    key={m.cod}
                    label={m.sigla}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 10,
                      bgcolor: `${b.color}15`,
                      color: b.color,
                      fontWeight: 600,
                    }}
                  />
                ))}
                {b.motivos.length > 3 && (
                  <Chip
                    label={`+${b.motivos.length - 3}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 10,
                      bgcolor: 'action.hover',
                      color: 'text.secondary',
                    }}
                  />
                )}
              </Stack>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
