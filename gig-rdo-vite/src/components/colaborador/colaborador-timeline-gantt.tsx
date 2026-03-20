import { Box, Paper, Typography, Stack, alpha, useTheme, useMediaQuery } from '@mui/material';
import type { Theme } from '@mui/material';
import type { ColaboradorTimelineDia } from '@/types/rdo-timeline-types';
import type { CargaHoraria } from '@/utils/gantt-utils';
import { timeToMinutes, minutesToPercent, HOUR_MARKERS, COLORS } from '@/utils/gantt-utils';
import { GanttDayRow } from './gantt-day-row';

interface ColaboradorTimelineGanttProps {
  dias: ColaboradorTimelineDia[];
  cargaHoraria: CargaHoraria | null;
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: color }} />
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Stack>
  );
}

export function ColaboradorTimelineGantt({
  dias,
  cargaHoraria,
}: ColaboradorTimelineGanttProps) {
  const theme = useTheme();
  const isXs = useMediaQuery((t: Theme) => t.breakpoints.down('sm'));

  const cargaInicio = cargaHoraria
    ? minutesToPercent(timeToMinutes(cargaHoraria.inicio))
    : 0;
  const cargaFim = cargaHoraria
    ? minutesToPercent(timeToMinutes(cargaHoraria.fim))
    : 100;
  const intervaloInicio = cargaHoraria
    ? minutesToPercent(timeToMinutes(cargaHoraria.intervaloInicio))
    : 50;
  const intervaloFim = cargaHoraria
    ? minutesToPercent(timeToMinutes(cargaHoraria.intervaloFim))
    : 57;

  const visibleMarkers = isXs
    ? HOUR_MARKERS.filter((h) => h % 2 === 0)
    : HOUR_MARKERS;

  const headerOffset = { xs: '68px', sm: '88px', md: '118px' };

  return (
    <Box>
      {/* Legend */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, md: 2 },
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 1.5, md: 3 }}
          flexWrap="wrap"
          useFlexGap
        >
          <LegendItem
            color={COLORS.produtivo.main}
            label={isXs ? 'Produtivo' : 'Atividade Produtiva'}
          />
          <LegendItem
            color={COLORS.almoco.main}
            label={isXs ? 'Almoco' : 'Almoco (desconto fixo)'}
          />
          <LegendItem
            color={COLORS.banheiro.main}
            label={isXs ? 'WC' : 'Banheiro (ate 10min)'}
          />
          <LegendItem color={COLORS.outros.main} label="Outros" />
          {!isXs && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box
                sx={{
                  width: 24,
                  height: 3,
                  borderRadius: 1,
                  bgcolor: COLORS.carga.main,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Carga Horaria
              </Typography>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Hour header - hidden on mobile */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1, md: 1.5 },
          mb: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Box sx={{ display: 'flex', ml: headerOffset }}>
          {visibleMarkers.map((hour) => (
            <Box
              key={hour}
              sx={{
                flex: 1,
                textAlign: 'left',
                borderLeft: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.5),
                pl: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                }}
              >
                {hour.toString().padStart(2, '0')}:00
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Day rows */}
      {dias.map((dia) => (
        <GanttDayRow
          key={dia.data}
          dia={dia}
          cargaHoraria={cargaHoraria}
          cargaInicio={cargaInicio}
          cargaFim={cargaFim}
          intervaloInicio={intervaloInicio}
          intervaloFim={intervaloFim}
          isXs={isXs}
        />
      ))}
    </Box>
  );
}
