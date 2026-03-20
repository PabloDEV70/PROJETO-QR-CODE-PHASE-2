import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Slide, alpha } from '@mui/material';
import { SystemUpdate } from '@mui/icons-material';

export function SwUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleUpdate = (reg: ServiceWorkerRegistration) => {
      setRegistration(reg);
      setShowUpdate(true);
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      if (reg.waiting) {
        handleUpdate(reg);
        return;
      }
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            handleUpdate(reg);
          }
        });
      });
    });
  }, []);

  const handleReload = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }, [registration]);

  const handleDismiss = useCallback(() => {
    setShowUpdate(false);
  }, []);

  return (
    <Slide direction="up" in={showUpdate} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          left: 16,
          right: 16,
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          boxShadow: 6,
        }}
      >
        <SystemUpdate sx={{ fontSize: 20 }} />
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, flex: 1 }}>
          Nova versao disponivel
        </Typography>
        <Button
          size="small"
          onClick={handleDismiss}
          sx={{ color: alpha('#fff', 0.7), minWidth: 'auto', fontSize: '0.75rem' }}
        >
          Depois
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleReload}
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            fontWeight: 700,
            fontSize: '0.75rem',
            '&:hover': { bgcolor: alpha('#fff', 0.9) },
          }}
        >
          Atualizar
        </Button>
      </Box>
    </Slide>
  );
}
