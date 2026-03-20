import { useState, useMemo, useCallback } from 'react';
import {
  Paper, Alert, AlertTitle, Collapse, IconButton, Badge, Stack,
  Typography, Box, Skeleton,
} from '@mui/material';
import {
  NotificationsActive, ExpandMore, ExpandLess, Close,
} from '@mui/icons-material';
import type { RdoAlert } from '@/utils/rdo-alert-engine';
import { useDismissedAlertsStore } from '@/stores/dismissed-alerts-store';

interface RdoAlertsPanelProps {
  alerts: RdoAlert[];
  isLoading: boolean;
  onNavigate: (params: {
    codparc?: string; rdomotivocod?: string; tab?: string;
  }) => void;
}

const SEV_MAP = {
  critical: 'error',
  warning: 'warning',
  info: 'info',
} as const;

export function RdoAlertsPanel({ alerts, isLoading, onNavigate }: RdoAlertsPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const { dismissedIds, dismiss } = useDismissedAlertsStore();

  const visible = useMemo(
    () => alerts.filter((a) => !dismissedIds.includes(a.id)),
    [alerts, dismissedIds],
  );

  const maxSeverity = useMemo(() => {
    if (visible.some((a) => a.severity === 'critical')) return 'error';
    if (visible.some((a) => a.severity === 'warning')) return 'warning';
    return 'info';
  }, [visible]);

  const handleClick = useCallback(
    (alert: RdoAlert) => {
      if (alert.codparc) {
        onNavigate({ codparc: String(alert.codparc) });
      } else if (alert.metric === 'espera') {
        onNavigate({ tab: '1' });
      }
    },
    [onNavigate],
  );

  if (isLoading) {
    return <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2.5 }} />;
  }

  if (visible.length === 0) return null;

  return (
    <Paper sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
      <Box
        onClick={() => setExpanded((v) => !v)}
        sx={{
          px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1,
          cursor: 'pointer', bgcolor: `${maxSeverity}.main`,
          color: '#fff', '&:hover': { filter: 'brightness(1.1)' },
        }}
      >
        <Badge badgeContent={visible.length} color="default"
          sx={{ '& .MuiBadge-badge': { bgcolor: 'rgba(255,255,255,0.3)', color: '#fff' } }}
        >
          <NotificationsActive sx={{ fontSize: 20 }} />
        </Badge>
        <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
          {visible.length} Alerta{visible.length !== 1 ? 's' : ''}
        </Typography>
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </Box>

      <Collapse in={expanded}>
        <Stack spacing={0.5} sx={{ p: 1.5 }}>
          {visible.map((a) => (
            <Alert
              key={a.id}
              severity={SEV_MAP[a.severity]}
              variant="outlined"
              sx={{
                py: 0.25, cursor: a.codparc || a.metric === 'espera' ? 'pointer' : 'default',
                '&:hover': { bgcolor: 'action.hover' },
                '& .MuiAlert-message': { py: 0.25 },
              }}
              action={
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); dismiss(a.id); }}>
                  <Close sx={{ fontSize: 16 }} />
                </IconButton>
              }
              onClick={() => handleClick(a)}
            >
              <AlertTitle sx={{ fontSize: 13, fontWeight: 700, mb: 0 }}>
                {a.title}
              </AlertTitle>
              <Typography variant="caption" color="text.secondary">
                {a.detail}
              </Typography>
            </Alert>
          ))}
        </Stack>
      </Collapse>
    </Paper>
  );
}
