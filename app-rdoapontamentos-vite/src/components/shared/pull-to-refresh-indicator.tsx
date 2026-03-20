import { Box, CircularProgress, alpha } from '@mui/material';
import { ArrowDownward } from '@mui/icons-material';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  progress: number;
}

export function PullToRefreshIndicator({ isPulling, isRefreshing, pullDistance, progress }: PullToRefreshIndicatorProps) {
  if (!isPulling && !isRefreshing) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: isRefreshing ? 48 : pullDistance,
        overflow: 'hidden',
        transition: isRefreshing ? 'height 0.2s ease' : 'none',
      }}
    >
      {isRefreshing ? (
        <CircularProgress size={24} thickness={4} />
      ) : (
        <Box
          sx={{
            transform: `rotate(${progress >= 1 ? 180 : 0}deg)`,
            transition: 'transform 0.2s ease',
            color: alpha('#000', 0.4),
          }}
        >
          <ArrowDownward sx={{ fontSize: 24, opacity: progress }} />
        </Box>
      )}
    </Box>
  );
}
