import { Paper, Typography, Stack, Box, Skeleton, Divider } from '@mui/material';
import { PlayArrow, Build, CheckCircle } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import type { OsEnrichedResponse } from '@/types/os-detail-types';

interface OsTimelineCardProps {
  os: OsEnrichedResponse | undefined;
  isLoading: boolean;
}

interface TimelineEvent {
  label: string;
  date: string;
  icon: typeof PlayArrow;
  color: string;
}

function formatDate(date: string): string {
  try {
    return format(parseISO(date), 'dd/MM/yyyy HH:mm');
  } catch {
    return date;
  }
}

export function OsTimelineCard({ os, isLoading }: OsTimelineCardProps) {
  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Timeline
        </Typography>
        <Stack spacing={1.5}>
          <Skeleton variant="rectangular" width="100%" height={40} />
          <Skeleton variant="rectangular" width="100%" height={40} />
        </Stack>
      </Paper>
    );
  }

  if (!os) return null;

  const events: TimelineEvent[] = [];

  if (os.DTABERTURA) {
    events.push({
      label: 'Abertura',
      date: os.DTABERTURA,
      icon: PlayArrow,
      color: '#0288d1',
    });
  }

  if (os.DATAINI) {
    events.push({
      label: 'Inicio Execucao',
      date: os.DATAINI,
      icon: Build,
      color: '#ed6c02',
    });
  }

  if (os.DATAFIN) {
    events.push({
      label: 'Finalizacao',
      date: os.DATAFIN,
      icon: CheckCircle,
      color: '#2e7d32',
    });
  }

  if (os.AD_FINALIZACAO && os.AD_FINALIZACAO !== os.DATAFIN) {
    events.push({
      label: 'Finalizado GIG',
      date: os.AD_FINALIZACAO,
      icon: CheckCircle,
      color: '#9c27b0',
    });
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Timeline
      </Typography>

      {events.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Sem eventos
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {events.map((event, index) => {
            const Icon = event.icon;
            return (
              <Box key={index}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: event.color,
                      flexShrink: 0,
                    }}
                  />
                  <Icon sx={{ fontSize: 20, color: event.color, flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {event.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(event.date)}
                    </Typography>
                  </Box>
                </Stack>
                {index < events.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
