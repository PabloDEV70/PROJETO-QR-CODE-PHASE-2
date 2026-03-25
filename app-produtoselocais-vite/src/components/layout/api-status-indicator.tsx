import { Tooltip, Typography, Stack, IconButton } from '@mui/material';
import { CloudOff, CloudDone } from '@mui/icons-material';
import { useApiHealth } from '@/hooks/use-api-health';

function TooltipContent() {
  const { isOnline, data } = useApiHealth();

  if (!isOnline) {
    return (
      <Stack spacing={0.25} sx={{ p: 0.25 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#ef5350' }}>
          API Offline
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={0.25} sx={{ p: 0.25 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: '#4caf50' }}>
        API Online — v{data!.api.version}
      </Typography>
    </Stack>
  );
}

export function ApiStatusIndicator() {
  const { isOnline } = useApiHealth();

  return (
    <Tooltip title={<TooltipContent />}>
      <IconButton
        size="small"
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
  );
}
