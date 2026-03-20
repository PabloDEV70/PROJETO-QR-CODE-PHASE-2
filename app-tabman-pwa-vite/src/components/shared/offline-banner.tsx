import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { WifiOff } from '@mui/icons-material';

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <Box
      sx={{
        bgcolor: 'error.main',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        py: 0.75,
        px: 2,
      }}
    >
      <WifiOff sx={{ fontSize: 18 }} />
      <Typography variant="body2" fontWeight={500}>
        Sem conexao com a internet
      </Typography>
    </Box>
  );
}
