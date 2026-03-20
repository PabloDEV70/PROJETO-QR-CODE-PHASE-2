import { useMemo } from 'react';
import { Paper, Typography, Box, Tooltip, Skeleton, Stack } from '@mui/material';
import { parseISO, getDay, getISOWeek, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RdoTimelinePoint } from '@/types/rdo-analytics-types';

interface Props {
  timeline?: RdoTimelinePoint[];
  isLoading: boolean;
}

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

interface CellData {
  dt: string; dayOfWeek: number; weekNum: number;
  horas: number; label: string;
}

function getHeatColor(value: number, max: number): string {
  if (max <= 0 || value <= 0) return 'rgba(0,0,0,0.04)';
  const ratio = Math.min(value / max, 1);
  if (ratio < 0.25) return 'rgba(59,130,246,0.15)';
  if (ratio < 0.5) return 'rgba(59,130,246,0.35)';
  if (ratio < 0.75) return 'rgba(59,130,246,0.55)';
  return 'rgba(59,130,246,0.8)';
}

export function RdoHeatmapSemanal({ timeline, isLoading }: Props) {
  const { cells, weeks, maxHoras } = useMemo(() => {
    if (!timeline?.length) return { cells: [], weeks: [] as number[], maxHoras: 0 };
    const mapped: CellData[] = timeline.map((p) => {
      const dt = parseISO(p.DTREF);
      const h = Math.max(0, Number(p.totalHoras));
      return {
        dt: p.DTREF, dayOfWeek: getDay(dt), weekNum: getISOWeek(dt),
        horas: h,
        label: format(dt, "dd/MM (EEEE)", { locale: ptBR }),
      };
    });
    const weeksSet = [...new Set(mapped.map((c) => c.weekNum))].sort((a, b) => a - b);
    const max = mapped.reduce((m, c) => Math.max(m, c.horas), 0);
    return { cells: mapped, weeks: weeksSet, maxHoras: max };
  }, [timeline]);

  if (isLoading) {
    return <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2.5 }} />;
  }
  if (cells.length === 0) return null;

  const cellSize = 28;
  const gap = 3;

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2.5 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
        Heatmap Semanal
      </Typography>

      <Box sx={{ display: 'flex', gap: 1 }}>
        {/* Day labels */}
        <Stack spacing={`${gap}px`} sx={{ pt: `${cellSize + gap}px` }}>
          {DIAS.map((d) => (
            <Typography key={d} variant="caption" color="text.secondary"
              sx={{ height: cellSize, lineHeight: `${cellSize}px`, fontSize: 10, width: 28 }}>
              {d}
            </Typography>
          ))}
        </Stack>

        {/* Grid */}
        <Box sx={{ display: 'flex', gap: `${gap}px`, overflow: 'auto' }}>
          {weeks.map((week) => (
            <Stack key={week} spacing={`${gap}px`}>
              <Typography variant="caption" color="text.disabled"
                sx={{ height: cellSize, lineHeight: `${cellSize}px`, textAlign: 'center', fontSize: 9 }}>
                S{week}
              </Typography>
              {DIAS.map((_, dayIdx) => {
                const cell = cells.find(
                  (c) => c.weekNum === week && c.dayOfWeek === dayIdx,
                );
                return (
                  <Tooltip
                    key={`${week}-${dayIdx}`} arrow
                    title={cell ? `${cell.label}: ${cell.horas.toFixed(1)}h` : 'Sem dados'}
                  >
                    <Box sx={{
                      width: cellSize, height: cellSize, borderRadius: 1,
                      bgcolor: cell ? getHeatColor(cell.horas, maxHoras) : 'rgba(0,0,0,0.03)',
                      cursor: cell ? 'default' : 'default',
                      transition: 'background-color 0.2s',
                      '&:hover': { filter: cell ? 'brightness(0.9)' : 'none' },
                    }} />
                  </Tooltip>
                );
              })}
            </Stack>
          ))}
        </Box>
      </Box>

      {/* Legend */}
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1.5 }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
          Menos
        </Typography>
        {[0.04, 0.15, 0.35, 0.55, 0.8].map((o) => (
          <Box key={o} sx={{
            width: 12, height: 12, borderRadius: 0.5,
            bgcolor: o === 0.04 ? 'rgba(0,0,0,0.04)' : `rgba(59,130,246,${o})`,
          }} />
        ))}
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
          Mais horas
        </Typography>
      </Stack>
    </Paper>
  );
}
