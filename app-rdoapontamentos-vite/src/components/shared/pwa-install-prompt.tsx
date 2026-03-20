import { useState, useCallback } from 'react';
import { Box, Button, Typography, Slide, alpha } from '@mui/material';
import { GetApp, IosShare } from '@mui/icons-material';
import { usePwaInstall, isIos } from '@/hooks/use-pwa-install';

export function PwaInstallPrompt() {
  const { isInstallable, promptInstall, dismiss, showIosPrompt } = usePwaInstall();
  const [visible, setVisible] = useState(true);

  const show = visible && (isInstallable || showIosPrompt);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    dismiss();
  }, [dismiss]);

  const handleInstall = useCallback(async () => {
    await promptInstall();
    setVisible(false);
  }, [promptInstall]);

  const iosMode = isIos() && showIosPrompt;

  return (
    <Slide direction="up" in={show} mountOnEnter unmountOnExit>
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
        {iosMode ? (
          <IosShare sx={{ fontSize: 20 }} />
        ) : (
          <GetApp sx={{ fontSize: 20 }} />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3 }}>
            Instalar App RDO
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', opacity: 0.85, lineHeight: 1.3 }}>
            {iosMode
              ? 'Toque em Compartilhar > Adicionar a Tela Inicio'
              : 'Acesse offline e receba notificacoes'}
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={handleDismiss}
          sx={{ color: alpha('#fff', 0.7), minWidth: 'auto', fontSize: '0.75rem' }}
        >
          Agora nao
        </Button>
        {!iosMode && (
          <Button
            size="small"
            variant="contained"
            onClick={handleInstall}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.75rem',
              '&:hover': { bgcolor: alpha('#fff', 0.9) },
            }}
          >
            Instalar
          </Button>
        )}
      </Box>
    </Slide>
  );
}
