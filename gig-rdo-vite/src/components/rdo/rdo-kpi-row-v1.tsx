import { useMemo } from 'react';
import { Grid, Paper, Box, Typography, Chip, Skeleton, Stack, Tooltip } from '@mui/material';
import { AccessTime, TrendingUp, ListAlt, Assignment, Speed } from '@mui/icons-material';
import type { RdoAnalyticsResumo, RdoComparativo } from '@/types/rdo-types';
import type { MotivoGroup } from '@/components/rdo/rdo-motivo-treemap';
import type { ProductivityResult } from '@/utils/motivo-productivity';
import {
  type TopMotivoV1, type KpiDefV1,
  fmtDelta, fmtHMin, buildTooltipsV1,
} from './rdo-kpi-row-v1-helpers';

interface Props {
  resumo?: RdoAnalyticsResumo;
  comparativo?: RdoComparativo;
  isLoading?: boolean;
  motivoGroups?: MotivoGroup[];
  motivoTotalMin?: number;
  productivity?: ProductivityResult;
}

export function RdoKpiRowV1({
  resumo, comparativo, isLoading, motivoGroups, motivoTotalMin, productivity,
}: Props) {
  const topMotivo = useMemo((): TopMotivoV1 | null => {
    if (motivoGroups?.length && motivoTotalMin && motivoTotalMin > 0) {
      const top = motivoGroups[0]!;
      return {
        sigla: top.sigla, descricao: top.descricao,
        horas: (top.totalMin / 60).toFixed(1),
      };
    }
    if (resumo) {
      return {
        sigla: resumo.topMotivoSigla || '', descricao: resumo.topMotivo || '',
        horas: '-',
      };
    }
    return null;
  }, [motivoGroups, motivoTotalMin, resumo]);

  const cards: KpiDefV1[] = useMemo(() => {
    if (!resumo) return [];
    const d = comparativo?.deltas;
    const tips = buildTooltipsV1(resumo, comparativo || null, topMotivo, productivity);
    const pv = productivity?.prodVsMetaPercent;
    const pctColor = pv != null
      ? (pv >= 100 ? '#16A34A' : pv >= 80 ? '#F59E0B' : '#d32f2f') : '#8B5CF6';
    const pctBg = pv != null
      ? (pv >= 100 ? 'rgba(22,163,74,0.08)' : pv >= 80 ? 'rgba(245,158,11,0.08)' : 'rgba(211,47,47,0.08)')
      : 'rgba(139,92,246,0.08)';
    const metaLabel = productivity?.totalMetaEfetivaMin
      ? `de ${fmtHMin(productivity.totalMetaEfetivaMin)}` : undefined;
    return [
      {
        key: 'meta', label: '% PRODUTIVIDADE', icon: <Speed />,
        color: pctColor, bg: pctBg,
        value: pv != null ? `${pv}%` : '-',
        hero: true, tooltip: tips.meta,
      },
      {
        key: 'horasProd', label: 'HORAS PROD', icon: <AccessTime />,
        color: '#16A34A', bg: 'rgba(22,163,74,0.08)',
        value: productivity ? fmtHMin(productivity.totalProdMin) : '-',
        deltaFmt: metaLabel,
        hero: true, tooltip: tips.horasProd,
      },
      {
        key: 'prod', label: 'TOP MOTIVO', icon: <TrendingUp />,
        color: '#3B82F6', bg: 'rgba(59,130,246,0.08)',
        value: topMotivo?.sigla || '-',
        deltaFmt: topMotivo ? `${topMotivo.horas}h` : undefined,
        tooltip: tips.prod,
      },
      {
        key: 'rdos', label: 'RDOS', icon: <ListAlt />,
        color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)',
        value: resumo.totalRdos?.toLocaleString('pt-BR') ?? '-',
        delta: d?.totalRdos, deltaFmt: d ? fmtDelta(d.totalRdos, '') : undefined,
        tooltip: tips.rdos,
      },
      {
        key: 'os', label: '% COM OS', icon: <Assignment />,
        color: '#06B6D4', bg: 'rgba(6,182,212,0.08)',
        value: resumo.percentualComOs != null
          ? `${resumo.percentualComOs.toFixed(0)}%` : '-',
        delta: d?.percentualComOs,
        deltaFmt: d ? fmtDelta(d.percentualComOs, '%') : undefined,
        tooltip: tips.os,
      },
    ];
  }, [resumo, comparativo, topMotivo, productivity]);

  if (isLoading || !resumo) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: i < 2 ? 3 : 2 }}>
            <Skeleton variant="rounded" height={90} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {cards.map((c) => (
        <Grid key={c.key} size={{ xs: 6, sm: 4, md: c.hero ? 3 : 2 }}>
          <Tooltip
            title={<span style={{ whiteSpace: 'pre-line' }}>{c.tooltip}</span>}
            arrow placement="bottom" enterDelay={400}
          >
            <Paper data-hoverable sx={{ px: 2, py: 1.5, height: '100%', borderRadius: 2.5 }}>
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
                </Stack>
                {c.deltaFmt && (
                  <Chip
                    label={c.deltaFmt} size="small"
                    sx={{
                      alignSelf: 'flex-start', height: 20, fontSize: 11, fontWeight: 600,
                      bgcolor: c.key === 'prod' || c.key === 'horasProd'
                        ? 'rgba(22,163,74,0.1)'
                        : (c.delta ?? 0) >= 0 ? 'rgba(22,163,74,0.1)' : 'rgba(211,47,47,0.1)',
                      color: c.key === 'prod' || c.key === 'horasProd'
                        ? '#16A34A'
                        : (c.delta ?? 0) >= 0 ? '#16A34A' : '#d32f2f',
                    }}
                  />
                )}
              </Stack>
            </Paper>
          </Tooltip>
        </Grid>
      ))}
    </Grid>
  );
}
