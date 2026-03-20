import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, LinearProgress, Typography } from '@mui/material';
import { useInactivity } from '@/hooks/use-inactivity';
import { useSessionStore } from '@/stores/session-store';

const TIMEOUT_MS = 45_000;
const WARN_SECONDS = 15;

interface Props {
  children: ReactNode;
}

export function InactivityGuard({ children }: Props) {
  const navigate = useNavigate();
  const endSession = useSessionStore((s) => s.endSession);

  const { remainingSeconds } = useInactivity(TIMEOUT_MS, () => {
    endSession();
    navigate('/', { replace: true });
  });

  const showWarning = remainingSeconds <= WARN_SECONDS && remainingSeconds > 0;
  const progress = showWarning
    ? (remainingSeconds / WARN_SECONDS) * 100
    : 100;

  return (
    <>
      {children}
      {showWarning && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0, 0, 0, 0.85)',
            color: '#fff',
            zIndex: 9999,
          }}
        >
          <LinearProgress
            variant="determinate"
            value={progress}
            color="warning"
            sx={{ height: 4 }}
          />
          <Box sx={{ py: 1.5, px: 3, textAlign: 'center' }}>
            <Typography variant="body2" fontWeight={600}>
              Voltando ao inicio em {remainingSeconds}s...
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
}
