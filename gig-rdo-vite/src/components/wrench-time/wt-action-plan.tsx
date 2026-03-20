import { Box, Chip, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { Warning, Info, PriorityHigh } from '@mui/icons-material';
import type { AcademicRecommendation } from '@/utils/wrench-time-academic';

interface WtActionPlanProps {
  recommendations: AcademicRecommendation[];
  isLoading?: boolean;
}

const PRIORITY_CONFIG = {
  alta: { color: '#EF4444', bgcolor: '#FEF2F2', icon: PriorityHigh, label: 'Alta' },
  media: { color: '#F59E0B', bgcolor: '#FFFBEB', icon: Warning, label: 'Media' },
  baixa: { color: '#3B82F6', bgcolor: '#EFF6FF', icon: Info, label: 'Baixa' },
} as const;

export function WtActionPlan({ recommendations, isLoading }: WtActionPlanProps) {
  if (!recommendations.length && !isLoading) return null;

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
        Plano de Acao Recomendado
      </Typography>
      {isLoading ? (
        <Skeleton variant="rounded" height={120} />
      ) : (
        <Stack spacing={1.5}>
          {recommendations.map((rec, i) => {
            const cfg = PRIORITY_CONFIG[rec.priority];
            const Icon = cfg.icon;
            return (
              <Paper
                key={i} variant="outlined"
                sx={{ p: 2, borderLeft: `4px solid ${cfg.color}`, bgcolor: cfg.bgcolor }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Icon sx={{ color: cfg.color, mt: 0.2 }} fontSize="small" />
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>{rec.title}</Typography>
                      <Chip
                        label={cfg.label} size="small"
                        sx={{ bgcolor: cfg.color, color: '#fff', height: 20, fontSize: 11 }}
                      />
                      {rec.impactPercent > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Impacto: ~{rec.impactPercent}%
                        </Typography>
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {rec.description}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
