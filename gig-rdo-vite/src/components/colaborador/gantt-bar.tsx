import { Box, Tooltip, Typography, Stack, alpha } from '@mui/material';
import { Warning, AccessTime } from '@mui/icons-material';
import type { ColaboradorTimelineDia } from '@/types/rdo-timeline-types';
import type { CargaHoraria } from '@/utils/gantt-utils';
import type { Theme } from '@mui/material';
import {
  minutesToPercent,
  timeToMinutes,
  HOUR_MARKERS,
  COLORS,
  getAtividadeColor,
} from '@/utils/gantt-utils';

interface GanttBarProps {
  dia: ColaboradorTimelineDia;
  cargaHoraria: CargaHoraria | null;
  cargaInicio: number;
  cargaFim: number;
  intervaloInicio: number;
  intervaloFim: number;
  gaps: { inicio: number; fim: number }[];
  theme: Theme;
}

export function GanttBar({
  dia,
  cargaHoraria,
  cargaInicio,
  cargaFim,
  intervaloInicio,
  intervaloFim,
  gaps,
  theme,
}: GanttBarProps) {
  return (
    <Box
      sx={{
        flex: 1,
        height: 40,
        position: 'relative',
        bgcolor: alpha(theme.palette.grey[500], 0.06),
        borderRadius: 1.5,
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* Carga horaria background */}
      {cargaHoraria && (
        <Box
          sx={{
            position: 'absolute',
            left: `${cargaInicio}%`,
            width: `${cargaFim - cargaInicio}%`,
            height: '100%',
            bgcolor: alpha(COLORS.carga.main, 0.06),
            borderLeft: '2px solid',
            borderRight: '2px solid',
            borderColor: alpha(COLORS.carga.main, 0.4),
          }}
        />
      )}

      {/* Lunch break hatching */}
      {cargaHoraria && (
        <Box
          sx={{
            position: 'absolute',
            left: `${intervaloInicio}%`,
            width: `${intervaloFim - intervaloInicio}%`,
            height: '100%',
            bgcolor: alpha(theme.palette.grey[500], 0.08),
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.02) 4px, rgba(0,0,0,0.02) 8px)',
          }}
        />
      )}

      {/* Gaps */}
      {gaps.map((gap, idx) => (
        <Tooltip key={idx} title={`Gap ${gap.fim - gap.inicio}min`} arrow>
          <Box
            sx={{
              position: 'absolute',
              left: `${minutesToPercent(gap.inicio)}%`,
              width: `${minutesToPercent(gap.fim) - minutesToPercent(gap.inicio)}%`,
              height: '100%',
              bgcolor: alpha(COLORS.gap.main, 0.08),
              border: '1px dashed',
              borderColor: alpha(COLORS.gap.main, 0.5),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Warning sx={{ fontSize: 14, color: COLORS.gap.main, opacity: 0.7 }} />
          </Box>
        </Tooltip>
      ))}

      {/* Activity blocks */}
      {dia.atividades.map((a) => {
        const start = minutesToPercent(timeToMinutes(a.hrini));
        const end = minutesToPercent(timeToMinutes(a.hrfim));
        const color = getAtividadeColor(a.rdomotivocod, a.isProdutivo);
        return (
          <Tooltip
            key={a.id}
            arrow
            placement="top"
            title={
              <Box sx={{ p: 0.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {a.motivoDescricao}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <AccessTime sx={{ fontSize: 12, opacity: 0.7 }} />
                  <Typography variant="caption">
                    {a.hrini} - {a.hrfim} ({a.duracaoMinutos}min)
                  </Typography>
                </Stack>
                {a.nuos && (
                  <Typography variant="caption" display="block">
                    OS: #{a.nuos}
                  </Typography>
                )}
                {a.veiculoPlaca && (
                  <Typography variant="caption" display="block">
                    Veiculo: {a.veiculoPlaca}
                  </Typography>
                )}
              </Box>
            }
          >
            <Box
              sx={{
                position: 'absolute',
                left: `${start}%`,
                width: `${Math.max(end - start, 0.5)}%`,
                top: 3,
                height: 34,
                bgcolor: color.main,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: `0 2px 4px ${alpha(color.main, 0.3)}`,
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: `0 4px 8px ${alpha(color.main, 0.4)}`,
                  zIndex: 10,
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.6rem',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  px: 0.3,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                {a.motivoSigla}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}

      {/* Hour grid lines */}
      {HOUR_MARKERS.map((hour) => (
        <Box
          key={hour}
          sx={{
            position: 'absolute',
            left: `${minutesToPercent(hour * 60)}%`,
            top: 0,
            bottom: 0,
            borderLeft: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.3),
            pointerEvents: 'none',
          }}
        />
      ))}
    </Box>
  );
}
