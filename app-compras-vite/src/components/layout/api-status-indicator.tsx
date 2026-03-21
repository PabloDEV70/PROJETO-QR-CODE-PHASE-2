import { useState } from 'react';
import { Tooltip, Typography, Stack, IconButton } from '@mui/material';
import { CloudOff, CloudDone } from '@mui/icons-material';
import { useApiHealth } from '@/hooks/use-api-health';
import { ApiHealthDialog } from '@/components/layout/api-health-dialog';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function TooltipContent() {
  const { isOnline, data } = useApiHealth();

  if (!isOnline) {
    return (
      <Stack spacing={0.25} sx={{ p: 0.25 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#ef5350' }}>
          API Offline
        </Typography>
        <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.7, fontSize: '0.65rem' }}>
          Clique para detalhes
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={0.25} sx={{ p: 0.25 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: '#4caf50' }}>
        API Online — v{data!.api.version}
      </Typography>
      <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.7, fontSize: '0.65rem' }}>
        Uptime {formatUptime(data!.uptime)} · Clique para detalhes
      </Typography>
    </Stack>
  );
}

export function ApiStatusIndicator() {
  const { isOnline } = useApiHealth();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Tooltip title={<TooltipContent />}>
        <IconButton
          size="small"
          onClick={() => setDialogOpen(true)}
          sx={{
            color: isOnline ? 'success.main' : 'error.main',
            transition: 'color 0.3s',
          }}
        >
          {isOnline
            ? <CloudDone sx={{ fontSize: 18 }} />
            : <CloudOff sx={{ fontSize: 18, animation: 'pulse 2s infinite' }} />}
        </IconButton>
      </Tooltip>

      <ApiHealthDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
