import { useMemo } from 'react';
import {
  Paper, Typography, Stack, Box, Grid, Chip, Skeleton,
  Tooltip, useTheme, type Theme,
} from '@mui/material';
import {
  HourglassEmpty, DirectionsCar, Restaurant, Build, Warning,
} from '@mui/icons-material';
import type { RdoComparativo, RdoTimelinePoint } from '@/types/rdo-types';
import type { MotivoGroup } from '@/components/rdo/rdo-motivo-treemap';
import { fmtMin } from '@/utils/wrench-time-categories';
import {
  buildCategories, buildInsights,
  type CategoryRow, type Insight,
} from '@/components/rdo/rdo-trend-insights-logic';

interface Props {
  groups: MotivoGroup[];
  totalMin: number;
  comparativo?: RdoComparativo;
  timeline?: RdoTimelinePoint[];
  isLoading?: boolean;
  configMode?: string;
}

const CAT_ICONS: Record<string, React.ReactNode> = {
  wrenchTime: <Build sx={{ fontSize: 16 }} />,
  espera: <HourglassEmpty sx={{ fontSize: 16 }} />,
  pausas: <Restaurant sx={{ fontSize: 16 }} />,
  desloc: <DirectionsCar sx={{ fontSize: 16 }} />,
  externos: <Warning sx={{ fontSize: 16 }} />,
  buro: <Build sx={{ fontSize: 16 }} />,
  trein: <Build sx={{ fontSize: 16 }} />,
};

export function RdoTrendInsights({
  groups, totalMin, comparativo, timeline, isLoading, configMode,
}: Props) {
  const theme = useTheme();

  const categories = useMemo(
    (): CategoryRow[] => buildCategories(groups, totalMin, CAT_ICONS),
    [groups, totalMin],
  );

  const insights = useMemo(
    (): Insight[] => buildInsights(categories, groups, totalMin, comparativo, timeline, configMode),
    [categories, comparativo, groups, timeline, totalMin, configMode],
  );

  if (isLoading) {
    return <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2.5 }} />;
  }
  if (categories.length === 0) return null;

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2.5 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        Distribuicao do Tempo
      </Typography>

      <Box sx={{
        display: 'flex', height: 28, borderRadius: 2, overflow: 'hidden', mb: 1.5,
      }}>
        {categories.map((c) => (
          <Tooltip
            key={c.key} arrow
            title={
              <span style={{ whiteSpace: 'pre-line' }}>
                {`${c.label}: ${fmtMin(c.min)} (${c.pct.toFixed(1)}%)\nMotivos: ${c.motivos.join(', ')}\nBase: ${fmtMin(totalMin)} total`}
              </span>
            }
          >
            <Box sx={{
              width: `${c.pct}%`, bgcolor: c.color, minWidth: c.pct > 2 ? 4 : 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'width 0.5s ease',
              '&:hover': { filter: 'brightness(1.15)' },
            }}>
              {c.pct > 8 && (
                <Typography sx={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>
                  {c.pct.toFixed(0)}%
                </Typography>
              )}
            </Box>
          </Tooltip>
        ))}
      </Box>

      <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mb: 2 }}>
        {categories.map((c) => (
          <Tooltip key={c.key} title={`${c.motivos.join(', ')}`} arrow>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{
                width: 10, height: 10, borderRadius: '50%', bgcolor: c.color,
              }} />
              <Typography variant="caption" color="text.secondary">
                {c.label} {fmtMin(c.min)}
              </Typography>
            </Stack>
          </Tooltip>
        ))}
        <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto !important' }}>
          Total {fmtMin(totalMin)}
        </Typography>
      </Stack>

      {insights.length > 0 && (
        <InsightChips insights={insights} theme={theme} />
      )}

      <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
        Classificacao baseada na configuracao de produtividade ativa
      </Typography>
    </Paper>
  );
}

function InsightChips(
  { insights, theme }: { insights: Insight[]; theme: Theme },
) {
  const sev = {
    success: { bg: 'rgba(46,125,50,0.08)', fg: theme.palette.success.main },
    warning: { bg: 'rgba(237,108,2,0.08)', fg: theme.palette.warning.main },
    error: { bg: 'rgba(211,47,47,0.08)', fg: theme.palette.error.main },
    info: { bg: 'rgba(2,136,209,0.08)', fg: theme.palette.info.main },
  } as const;

  return (
    <Grid container spacing={1}>
      {insights.map((ins, i) => {
        const c = sev[ins.severity];
        return (
          <Grid key={i} size={{ xs: 12, sm: 6 }}>
            <Tooltip
              title={<span style={{ whiteSpace: 'pre-line' }}>{ins.tooltip}</span>}
              arrow
            >
              <Chip
                icon={ins.icon}
                label={ins.text}
                size="small"
                sx={{
                  width: '100%', justifyContent: 'flex-start',
                  height: 'auto', py: 0.5,
                  '& .MuiChip-label': {
                    whiteSpace: 'normal', fontSize: 12, lineHeight: 1.3,
                  },
                  bgcolor: c.bg, color: c.fg,
                  '& .MuiChip-icon': { color: c.fg },
                }}
              />
            </Tooltip>
          </Grid>
        );
      })}
    </Grid>
  );
}
