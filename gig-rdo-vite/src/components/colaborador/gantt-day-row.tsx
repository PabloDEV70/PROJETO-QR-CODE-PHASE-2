import { Box, Paper, Typography, Stack, Chip, alpha, useTheme } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { format } from 'date-fns';
import type { ColaboradorTimelineDia } from '@/types/rdo-timeline-types';
import type { CargaHoraria } from '@/utils/gantt-utils';
import {
  COLORS,
  formatMinutos,
  formatMinutosSigned,
  detectGaps,
  parseDateSafe,
} from '@/utils/gantt-utils';
import { GanttBar } from './gantt-bar';

interface GanttDayRowProps {
  dia: ColaboradorTimelineDia;
  cargaHoraria: CargaHoraria | null;
  cargaInicio: number;
  cargaFim: number;
  intervaloInicio: number;
  intervaloFim: number;
  isXs: boolean;
}

function saldoChipColor(dia: ColaboradorTimelineDia) {
  const he = (dia.meta.horaExtraMin || 0) > 0;
  if (he) return { bg: COLORS.horaExtra.main, fg: COLORS.horaExtra.main };
  if (dia.meta.saldoMin < 0) return { bg: COLORS.gap.main, fg: COLORS.gap.main };
  return { bg: COLORS.produtivo.main, fg: COLORS.produtivo.dark };
}

export function GanttDayRow({
  dia,
  cargaHoraria,
  cargaInicio,
  cargaFim,
  intervaloInicio,
  intervaloFim,
  isXs,
}: GanttDayRowProps) {
  const theme = useTheme();
  const metaOk = dia.meta.atingiuMeta;
  const parsed = parseDateSafe(dia.data);
  const dayAbbr = dia.diaSemanaLabel.slice(0, 3);
  const dateStr = format(parsed, 'dd/MM');
  const gaps = detectGaps(dia.atividades, cargaHoraria);
  const saldoColor = saldoChipColor(dia);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: metaOk
          ? alpha(COLORS.produtivo.main, 0.4)
          : theme.palette.divider,
        bgcolor: metaOk
          ? alpha(COLORS.produtivo.main, 0.03)
          : 'transparent',
        px: { xs: 0.5, sm: 1 },
        py: 0.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {/* Left: day info */}
        <Box
          sx={{
            width: { xs: 60, sm: 80, md: 110 },
            flexShrink: 0,
          }}
        >
          <Typography
            variant="caption"
            fontWeight={600}
            sx={{ lineHeight: 1.2, display: 'block' }}
          >
            {dayAbbr} {dateStr}
          </Typography>

          <Stack direction="row" spacing={0.3} sx={{ mt: 0.3, flexWrap: 'wrap' }}>
            {/* Meta % chip */}
            <Chip
              size="small"
              icon={
                metaOk
                  ? <CheckCircle sx={{ fontSize: 12 }} />
                  : <Cancel sx={{ fontSize: 12 }} />
              }
              label={`${Math.round(dia.meta.percentMeta)}%`}
              sx={{
                height: 18,
                fontSize: '0.6rem',
                fontWeight: 700,
                bgcolor: alpha(metaOk ? COLORS.produtivo.main : COLORS.gap.main, 0.1),
                color: metaOk ? COLORS.produtivo.dark : COLORS.gap.main,
                '& .MuiChip-icon': {
                  color: metaOk ? COLORS.produtivo.main : COLORS.gap.main,
                },
              }}
            />

            {/* Saldo chip */}
            <Chip
              size="small"
              label={formatMinutosSigned(dia.meta.saldoMin)}
              sx={{
                height: 18,
                fontSize: '0.6rem',
                fontWeight: 700,
                bgcolor: alpha(saldoColor.bg, 0.1),
                color: saldoColor.fg,
              }}
            />
          </Stack>

          {/* Jornada delay chips (desktop only) */}
          {!isXs && dia.jornada && (
            <Stack direction="row" spacing={0.3} sx={{ mt: 0.3, flexWrap: 'wrap' }}>
              {dia.jornada.atrasoMin > 0 && (
                <Chip
                  size="small"
                  label={`atraso ${formatMinutos(dia.jornada.atrasoMin)}`}
                  sx={{
                    height: 16,
                    fontSize: '0.55rem',
                    bgcolor: alpha(COLORS.gap.main, 0.08),
                    color: COLORS.gap.main,
                  }}
                />
              )}
              {dia.jornada.saidaAntecipadaMin > 0 && (
                <Chip
                  size="small"
                  label={`saida -${formatMinutos(dia.jornada.saidaAntecipadaMin)}`}
                  sx={{
                    height: 16,
                    fontSize: '0.55rem',
                    bgcolor: alpha(COLORS.horaExtra.main, 0.08),
                    color: COLORS.horaExtra.main,
                  }}
                />
              )}
            </Stack>
          )}
        </Box>

        {/* Center: Gantt bar */}
        <GanttBar
          dia={dia}
          cargaHoraria={cargaHoraria}
          cargaInicio={cargaInicio}
          cargaFim={cargaFim}
          intervaloInicio={intervaloInicio}
          intervaloFim={intervaloFim}
          gaps={gaps}
          theme={theme}
        />

        {/* Right: summary */}
        <Box
          sx={{
            width: { xs: 50, sm: 60, md: 75 },
            flexShrink: 0,
            textAlign: 'right',
          }}
        >
          <Typography variant="caption" fontWeight={700} sx={{ display: 'block' }}>
            {formatMinutos(dia.resumo.minutosProdu)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontSize: '0.6rem',
              color: 'text.secondary',
            }}
          >
            de {formatMinutos(dia.meta.metaEfetivaMin)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
