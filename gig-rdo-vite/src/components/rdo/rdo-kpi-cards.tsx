import { useMemo } from 'react';
import { Grid, Paper, Box, Typography, Chip, Skeleton, Stack, Tooltip } from '@mui/material';
import {
  AccessTime, TrendingUp, ListAlt, People, Assignment, Speed, BarChart,
} from '@mui/icons-material';
import type { RdoAnalyticsResumo, RdoComparativo } from '@/types/rdo-types';
import type { RdoTimelinePoint } from '@/types/rdo-analytics-types';
import type { MotivoGroup } from '@/components/rdo/rdo-motivo-treemap';
import {
  computeAnteriorRange, computeTopMotivo, buildKpiCards, type KpiDef,
} from './rdo-kpi-helpers';

const ICONS: Record<string, React.ReactNode> = {
  horas: <AccessTime />, prodPct: <BarChart />, top: <TrendingUp />,
  rdos: <ListAlt />, colabs: <People />, os: <Assignment />, media: <Speed />,
};

const TREND_SYMBOLS = { up: '▲', down: '▼', stable: '—' } as const;
const TREND_COLORS = { up: '#16A34A', down: '#d32f2f', stable: '#9e9e9e' } as const;

interface Props {
  resumo?: RdoAnalyticsResumo;
  comparativo?: RdoComparativo;
  isLoading: boolean;
  motivoGroups?: MotivoGroup[];
  motivoTotalMin?: number;
  dataInicio?: string;
  dataFim?: string;
  produtividadePercent?: number;
  configMode?: string;
  motivosProdutivos?: string[];
  totalProdMin?: number;
  totalMinutosPrevistos?: number;
  totalNaoProdMin?: number;
  totalMetaEfetivaMin?: number;
  totalToleranciaDeducaoMin?: number;
  prodVsMetaPercent?: number;
  timeline?: RdoTimelinePoint[];
}

export function RdoKpiCards({
  resumo, comparativo, isLoading, motivoGroups, motivoTotalMin,
  dataInicio, dataFim, produtividadePercent, configMode, motivosProdutivos,
  totalProdMin, totalNaoProdMin, totalMinutosPrevistos, totalMetaEfetivaMin,
  totalToleranciaDeducaoMin, prodVsMetaPercent, timeline,
}: Props) {
  const antRange = useMemo(
    () => computeAnteriorRange(dataInicio, dataFim), [dataInicio, dataFim],
  );
  const topMotivo = useMemo(
    () => computeTopMotivo(motivoGroups, motivoTotalMin),
    [motivoGroups, motivoTotalMin],
  );

  const cards: KpiDef[] = useMemo(() => {
    if (!resumo) return [];
    return buildKpiCards({
      resumo, comparativo, topMotivo, antRange,
      produtividadePercent, configMode, motivosProdutivos,
      totalProdMin, totalNaoProdMin, totalMetaEfetivaMin,
      totalMinutosPrevistos, totalToleranciaDeducaoMin,
      prodVsMetaPercent, timeline, icons: ICONS,
    });
  }, [resumo, comparativo, topMotivo, antRange, produtividadePercent,
    configMode, motivosProdutivos, totalProdMin, totalNaoProdMin,
    totalMetaEfetivaMin, totalMinutosPrevistos, totalToleranciaDeducaoMin,
    prodVsMetaPercent, timeline]);

  if (isLoading || !resumo) {
    return (
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: i < 2 ? 2.4 : 1.52 }}>
            <Skeleton variant="rounded" height={90} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {cards.map((c) => (
        <Grid key={c.key} size={{ xs: 6, sm: 4, md: c.hero ? 2.4 : 1.52 }}>
          <Tooltip
            title={<span style={{ whiteSpace: 'pre-line' }}>{c.tooltip}</span>}
            arrow placement="bottom" enterDelay={400}
          >
            <Paper sx={{ px: 2, py: 1.5, height: '100%', borderRadius: 2.5 }}>
              <Stack spacing={0.5}>
                <Typography
                  variant="overline" color="text.secondary"
                  sx={{ fontSize: '0.6875rem', lineHeight: 1.2 }}
                >
                  {c.label}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{
                    display: 'flex', p: 0.75, borderRadius: 1.5,
                    bgcolor: c.bg, color: c.color,
                  }}>
                    {c.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={700} lineHeight={1}>
                    {c.value}
                  </Typography>
                  {c.trend && (
                    <Tooltip title={c.trendLabel ?? ''} arrow>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: 14, fontWeight: 700, ml: 0.5,
                          color: TREND_COLORS[c.trend],
                        }}
                      >
                        {TREND_SYMBOLS[c.trend]}
                      </Typography>
                    </Tooltip>
                  )}
                </Stack>
                {c.deltaFmt && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Chip
                      label={c.deltaFmt} size="small"
                      sx={{
                        height: 20, fontSize: 11, fontWeight: 600,
                        bgcolor: c.key === 'top' ? 'rgba(139,92,246,0.1)' : (
                          (c.delta ?? 0) >= 0 ? 'rgba(22,163,74,0.1)' : 'rgba(211,47,47,0.1)'
                        ),
                        color: c.key === 'top' ? '#8B5CF6' : (
                          (c.delta ?? 0) >= 0 ? '#16A34A' : '#d32f2f'
                        ),
                      }}
                    />
                    {antRange && c.key !== 'top' && c.key !== 'prodPct' && (
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                        vs {antRange.label}
                      </Typography>
                    )}
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Tooltip>
        </Grid>
      ))}
    </Grid>
  );
}
