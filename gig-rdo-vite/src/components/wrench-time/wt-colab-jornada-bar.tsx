import { Box, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { getCategoryMeta, fmtMin } from '@/utils/wrench-time-categories';
import type { ColaboradorTimelineDia } from '@/types/rdo-types';
import {
  buildSegments, buildHourTicks, buildGaps,
  hrToMin, minToHr,
} from './wt-jornada-bar-helpers';

interface WtColabJornadaBarProps {
  dia: ColaboradorTimelineDia;
}

export function WtColabJornadaBar({ dia }: WtColabJornadaBarProps) {
  const segments = buildSegments(dia);

  if (!segments.length) {
    return (
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AccessTime color="disabled" />
          <Typography variant="body2" color="text.secondary">
            Sem atividades para visualizar
          </Typography>
        </Stack>
      </Paper>
    );
  }

  const dayStart = segments[0]!.s;
  const dayEnd = segments[segments.length - 1]!.e;
  const totalSpan = dayEnd - dayStart;
  if (totalSpan <= 0) return null;

  const j = dia.jornada;
  const jStart = j ? hrToMin(j.jornadaIniPrevisto) : null;
  const jEnd = j ? hrToMin(j.jornadaFimPrevisto) : null;
  const hourTicks = buildHourTicks(dayStart, dayEnd);
  const gaps = buildGaps(segments);
  const usedCats = [...new Set(segments.map((s) => s.catKey))];

  const pct = (mins: number) => ((mins - dayStart) / totalSpan) * 100;

  return (
    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <AccessTime color="primary" fontSize="small" />
        <Typography variant="subtitle2" fontWeight={600}>Linha do Tempo</Typography>
        <Typography variant="caption" color="text.secondary">
          {minToHr(dayStart)} — {minToHr(dayEnd)} ({fmtMin(totalSpan)})
        </Typography>
      </Stack>

      <Box sx={{ position: 'relative', height: 48, mb: 0.5 }}>
        <Box sx={{
          position: 'absolute', inset: 0, bgcolor: 'grey.50',
          borderRadius: 2, border: '1px solid', borderColor: 'grey.200',
        }} />

        {jStart !== null && jEnd !== null && (
          <Tooltip title={`Previsto: ${minToHr(jStart)}–${minToHr(jEnd)}`} arrow>
            <Box sx={{
              position: 'absolute', top: 0, height: '100%',
              left: `${pct(Math.max(jStart, dayStart))}%`,
              width: `${pct(Math.min(jEnd, dayEnd)) - pct(Math.max(jStart, dayStart))}%`,
              bgcolor: 'primary.main', opacity: 0.06, borderRadius: 2,
              border: '1.5px dashed', borderColor: 'primary.light',
              pointerEvents: 'none', zIndex: 1,
            }} />
          </Tooltip>
        )}

        {gaps.map((g, i) => (
          <Tooltip key={`gap-${i}`} title={`Intervalo: ${fmtMin(g.dur)}`} arrow>
            <Box sx={{
              position: 'absolute', top: 6, height: 36, borderRadius: 1,
              left: `${pct(g.s)}%`, width: `${Math.max((g.dur / totalSpan) * 100, 0.3)}%`,
              bgcolor: 'grey.200', opacity: 0.5, zIndex: 1,
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 6px)',
            }} />
          </Tooltip>
        ))}

        {segments.map((seg, i) => (
          <Tooltip key={i} title={`${minToHr(seg.s)}–${minToHr(seg.e)}: ${seg.label}`} arrow>
            <Box sx={{
              position: 'absolute', top: 6, height: 36, borderRadius: 1.5,
              left: `${pct(seg.s)}%`, width: `${Math.max((seg.dur / totalSpan) * 100, 0.4)}%`,
              bgcolor: seg.color, opacity: 0.88, zIndex: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              '&:hover': { opacity: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transform: 'scaleY(1.08)' },
              transition: 'all 0.15s ease',
            }} />
          </Tooltip>
        ))}

        {hourTicks.map((t) => (
          <Box key={t} sx={{
            position: 'absolute', top: 0, height: '100%',
            left: `${pct(t)}%`, width: '1px', bgcolor: 'grey.300',
            zIndex: 3, pointerEvents: 'none',
          }} />
        ))}
      </Box>

      <Box sx={{ position: 'relative', height: 16, mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary"
          sx={{ position: 'absolute', left: 0, fontSize: '0.65rem' }}>
          {minToHr(dayStart)}
        </Typography>
        {hourTicks.map((t) => (
          <Typography key={t} variant="caption" color="text.disabled"
            sx={{
              position: 'absolute', left: `${pct(t)}%`,
              transform: 'translateX(-50%)', fontSize: '0.6rem',
            }}>
            {minToHr(t)}
          </Typography>
        ))}
        <Typography variant="caption" color="text.secondary"
          sx={{ position: 'absolute', right: 0, fontSize: '0.65rem' }}>
          {minToHr(dayEnd)}
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {usedCats.map((cat) => {
          const meta = getCategoryMeta(cat);
          return (
            <Stack key={cat} direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: meta.color, opacity: 0.85 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {meta.label}
              </Typography>
            </Stack>
          );
        })}
        {jStart !== null && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{
              width: 10, height: 10, borderRadius: 0.5,
              border: '1.5px dashed', borderColor: 'primary.light',
            }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Jornada prevista
            </Typography>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
