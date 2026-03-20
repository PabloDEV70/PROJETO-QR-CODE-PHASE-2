import { useMemo } from 'react';
import { Paper, Typography, Box, Chip, Stack, Skeleton, Tooltip } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RdoTimelinePoint } from '@/types/rdo-analytics-types';

interface Props {
  timeline?: RdoTimelinePoint[];
  mediaHorasDia?: number;
  isLoading: boolean;
}

interface DayStatus {
  dt: string; label: string; horas: number; pct: number;
  color: 'success' | 'warning' | 'error';
}

export function RdoMetaHistorico({ timeline, mediaHorasDia, isLoading }: Props) {
  const days = useMemo((): DayStatus[] => {
    if (!timeline?.length || !mediaHorasDia || mediaHorasDia <= 0) return [];
    return timeline.map((p) => {
      const h = Math.max(0, Number(p.totalHoras));
      const pct = Math.round((h / mediaHorasDia) * 100);
      const color: 'success' | 'warning' | 'error' =
        pct >= 90 ? 'success' : pct >= 70 ? 'warning' : 'error';
      let label: string;
      try {
        label = format(parseISO(p.DTREF), 'dd/MM (EEE)', { locale: ptBR });
      } catch {
        label = p.DTREF;
      }
      return { dt: p.DTREF, label, horas: h, pct, color };
    });
  }, [timeline, mediaHorasDia]);

  if (isLoading) {
    return <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2.5 }} />;
  }
  if (days.length === 0) return null;

  const ok = days.filter((d) => d.color === 'success').length;
  const warn = days.filter((d) => d.color === 'warning').length;
  const bad = days.filter((d) => d.color === 'error').length;

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Historico de Atingimento
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {ok > 0 && <Chip size="small" label={`${ok} ok`} color="success" variant="outlined"
            sx={{ height: 20, fontSize: 10 }} />}
          {warn > 0 && <Chip size="small" label={`${warn} parcial`} color="warning" variant="outlined"
            sx={{ height: 20, fontSize: 10 }} />}
          {bad > 0 && <Chip size="small" label={`${bad} abaixo`} color="error" variant="outlined"
            sx={{ height: 20, fontSize: 10 }} />}
        </Stack>
      </Stack>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {days.map((d) => (
          <Tooltip
            key={d.dt} arrow
            title={`${d.label}: ${d.horas.toFixed(1)}h (${d.pct}% da media)`}
          >
            <Chip
              size="small"
              label={`${d.label.split(' ')[0]} ${d.pct}%`}
              color={d.color}
              variant="outlined"
              sx={{
                height: 24, fontSize: 11, fontWeight: 600,
                borderWidth: 1.5,
              }}
            />
          </Tooltip>
        ))}
      </Box>

      <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
        Referencia: media {mediaHorasDia?.toFixed(1)}h/dia | Verde &ge;90% | Amarelo 70-90% | Vermelho &lt;70%
      </Typography>
    </Paper>
  );
}
