import { useNavigate } from 'react-router-dom';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import type { VehicleOsItem } from '@/types/vehicle-detail-types';

function safeFormatDate(value: unknown, fmt = 'dd/MM/yyyy'): string {
  if (!value) return '-';
  let d: Date;
  if (value instanceof Date) {
    d = value;
  } else if (typeof value === 'string') {
    d = parseISO(value);
  } else if (typeof value === 'number') {
    d = new Date(value);
  } else {
    return '-';
  }
  return isValid(d) ? format(d, fmt) : '-';
}

interface VehicleHistoryTimelineProps {
  osHistory?: VehicleOsItem[];
  isLoading: boolean;
}

export function VehicleHistoryTimeline({ osHistory, isLoading }: VehicleHistoryTimelineProps) {
  const navigate = useNavigate();

  const getStatusColor = (
    status: string,
  ): 'info' | 'warning' | 'success' | 'error' => {
    if (status === 'A') return 'info';
    if (status === 'E') return 'warning';
    if (status === 'F') return 'success';
    if (status === 'C' || status === 'R') return 'error';
    return 'info';
  };

  const handleOsClick = (nuos: number) => {
    navigate(`/manutencao/os/${nuos}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton height={40} sx={{ mb: 1 }} />
          <Skeleton height={40} sx={{ mb: 1 }} />
          <Skeleton height={40} />
        </CardContent>
      </Card>
    );
  }

  if (!osHistory || osHistory.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Nenhuma OS encontrada</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Historico de OS
        </Typography>
        <Timeline>
          {osHistory.map((os, idx) => (
            <TimelineItem key={os.nuos}>
              <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                <Typography variant="caption">
                  {safeFormatDate(os.dtabertura)}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={getStatusColor(os.status)} />
                {idx < osHistory.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ flex: 1 }}>
                <Box
                  onClick={() => handleOsClick(os.nuos)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    OS {os.nuos} — {os.statusLabel}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {os.manutencaoLabel} • {os.totalServicos} servicos
                  </Typography>
                  {os.nomeParc && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      Executor: {os.nomeParc}
                    </Typography>
                  )}
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
}
