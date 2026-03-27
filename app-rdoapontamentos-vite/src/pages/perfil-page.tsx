import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Avatar, Button, LinearProgress,
  Switch, FormControlLabel, Chip, alpha, Divider, Collapse, IconButton,
} from '@mui/material';
import {
  Logout, DarkMode, LightMode, Timer, Storage, CloudSync,
  Info, ExpandMore, ExpandLess, Delete, Sync, Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { getAll, getPendingCount, getFailedCount, retryFailed, remove, type QueuedMutation } from '@/utils/offline-queue';
import type { DatabaseEnv } from '@shared/ui-lib';

declare const __APP_VERSION__: string;

function decodeJwtExp(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

function TokenCountdown({ token }: { token: string }) {
  const exp = decodeJwtExp(token);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!exp) return <Typography variant="body2" color="text.secondary">Token sem expiracao</Typography>;

  const remaining = Math.max(0, exp - now);
  const progress = Math.min(100, (remaining / (60 * 60 * 1000)) * 100);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const expired = remaining <= 0;

  const color = expired ? 'error' : progress > 50 ? 'success' : progress > 20 ? 'warning' : 'error';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" fontWeight={600}>
          {expired ? 'Sessao expirada' : `${minutes}m ${seconds}s restante(s)`}
        </Typography>
        <Chip label={expired ? 'Expirado' : 'Ativo'} size="small" color={expired ? 'error' : 'success'}
          sx={{ height: 20, fontSize: '0.65rem' }} />
      </Box>
      <LinearProgress variant="determinate" value={progress} color={color}
        sx={{ height: 6, borderRadius: 3 }} />
    </Box>
  );
}

function OfflineQueueSection() {
  const [pending, setPending] = useState(0);
  const [failed, setFailed] = useState(0);
  const [items, setItems] = useState<QueuedMutation[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    setPending(await getPendingCount());
    setFailed(await getFailedCount());
    if (expanded) setItems(await getAll());
  }, [expanded]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleRetry = async () => {
    setSyncing(true);
    await retryFailed();
    await refresh();
    setSyncing(false);
  };

  const handleRemove = async (id: string) => {
    await remove(id);
    await refresh();
  };

  const total = pending + failed;

  return (
    <Card variant="outlined">
      <CardContent sx={{ pb: '12px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CloudSync sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="subtitle2" fontWeight={700} flex={1}>Fila Offline</Typography>
          {total > 0 && (
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="body2">Pendentes: <b>{pending}</b></Typography>
          <Typography variant="body2" color="error.main">Com erro: <b>{failed}</b></Typography>
        </Box>
        {failed > 0 && (
          <Button size="small" startIcon={<Sync />} onClick={handleRetry} disabled={syncing} sx={{ mt: 1 }}>
            {syncing ? 'Sincronizando...' : 'Reenviar com erro'}
          </Button>
        )}
        <Collapse in={expanded}>
          <Box sx={{ mt: 1 }}>
            {items.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  bgcolor: item.status === 'failed' ? '#EF4444' : item.status === 'syncing' ? '#3B82F6' : '#F59E0B' }} />
                <Typography variant="caption" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.method.toUpperCase()} {item.url}
                </Typography>
                <IconButton size="small" onClick={() => handleRemove(item.id)} sx={{ p: 0.25 }}>
                  <Delete sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export function PerfilPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const database = useAuthStore((s) => s.database);
  const setDatabase = useAuthStore((s) => s.setDatabase);
  const logout = useAuthStore((s) => s.logout);
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const handleDbChange = (db: DatabaseEnv) => {
    setDatabase(db);
    queryClient.invalidateQueries();
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const dbColors: Record<DatabaseEnv, string> = {
    PROD: '#EF4444',
    TESTE: '#3B82F6',
    TREINA: '#22C55E',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 2, maxWidth: 480, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 1 }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 700 }}>
          {user?.nome?.charAt(0) ?? '?'}
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            {user?.nome ?? 'Usuario'}
          </Typography>
          {user?.pertencedp && (
            <Typography variant="caption" color="text.secondary">{user.pertencedp}</Typography>
          )}
        </Box>
      </Box>

      {/* Token */}
      <Card variant="outlined">
        <CardContent sx={{ pb: '12px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Timer sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="subtitle2" fontWeight={700}>Sessao</Typography>
          </Box>
          {user?.token ? <TokenCountdown token={user.token} /> : (
            <Typography variant="body2" color="text.secondary">Sem token</Typography>
          )}
        </CardContent>
      </Card>

      {/* Database */}
      <Card variant="outlined">
        <CardContent sx={{ pb: '12px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Storage sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="subtitle2" fontWeight={700}>Banco de Dados</Typography>
          </Box>
          {database === 'PROD' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, color: '#EF4444' }}>
              <Warning sx={{ fontSize: 14 }} />
              <Typography variant="caption" fontWeight={600}>Ambiente de producao</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(['PROD', 'TESTE', 'TREINA'] as DatabaseEnv[]).map((db) => (
              <Button
                key={db}
                size="small"
                variant={database === db ? 'contained' : 'outlined'}
                onClick={() => handleDbChange(db)}
                sx={{
                  flex: 1,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  bgcolor: database === db ? dbColors[db] : 'transparent',
                  borderColor: dbColors[db],
                  color: database === db ? 'white' : dbColors[db],
                  '&:hover': {
                    bgcolor: database === db ? dbColors[db] : alpha(dbColors[db], 0.08),
                    borderColor: dbColors[db],
                  },
                }}
              >
                {db}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Offline Queue */}
      <OfflineQueueSection />

      {/* Settings */}
      <Card variant="outlined">
        <CardContent sx={{ pb: '12px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Info sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="subtitle2" fontWeight={700}>Configuracoes</Typography>
          </Box>
          <FormControlLabel
            control={<Switch checked={mode === 'dark'} onChange={toggleTheme} size="small" />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {mode === 'dark' ? <DarkMode sx={{ fontSize: 16 }} /> : <LightMode sx={{ fontSize: 16 }} />}
                <Typography variant="body2">{mode === 'dark' ? 'Tema escuro' : 'Tema claro'}</Typography>
              </Box>
            }
          />
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Versao {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'}
          </Typography>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outlined"
        color="error"
        startIcon={<Logout />}
        onClick={handleLogout}
        fullWidth
        sx={{ fontWeight: 700 }}
      >
        Sair
      </Button>
    </Box>
  );
}

export default PerfilPage;
