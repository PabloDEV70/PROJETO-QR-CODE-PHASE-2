import { useState, useEffect } from 'react';
import { Box, Typography, Button, Switch, Stack, Paper } from '@mui/material';
import { Logout, Refresh, DarkMode } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { getPendingCount, getFailedCount, retryFailed } from '@/utils/offline-queue';
import { useNavigate } from 'react-router-dom';

declare const __APP_VERSION__: string;

export function ConfigPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { mode, toggleTheme } = useThemeStore();
  const [pending, setPending] = useState(0);
  const [failed, setFailed] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const refresh = async () => { setPending(await getPendingCount()); setFailed(await getFailedCount()); };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = async () => {
    setSyncing(true);
    await retryFailed();
    setPending(await getPendingCount());
    setFailed(await getFailedCount());
    setSyncing(false);
  };

  return (
    <>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Configuracoes</Typography>
      <Stack spacing={1.5}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center"><DarkMode sx={{ fontSize: 20 }} /><Typography variant="body2">Tema escuro</Typography></Stack>
            <Switch checked={mode === 'dark'} onChange={toggleTheme} />
          </Stack>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Fila offline</Typography>
          <Typography variant="caption" color="text.secondary">{pending} pendente(s), {failed} com erro</Typography>
          {failed > 0 && (
            <Box sx={{ mt: 1 }}>
              <Button size="small" startIcon={<Refresh />} onClick={handleRetry} disabled={syncing}>{syncing ? 'Sincronizando...' : 'Retentar'}</Button>
            </Box>
          )}
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">Versao: {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'}</Typography>
        </Paper>
        <Button variant="outlined" color="error" startIcon={<Logout />} onClick={() => { logout(); navigate('/login'); }} fullWidth sx={{ mt: 2 }}>
          Sair
        </Button>
      </Stack>
    </>
  );
}
