import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Collapse, IconButton, alpha } from '@mui/material';
import { WifiOff, Sync, ExpandMore, ExpandLess, Delete } from '@mui/icons-material';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { getAll, getPendingCount, getFailedCount, retryFailed, remove, type QueuedMutation } from '@/utils/offline-queue';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState<QueuedMutation[]>([]);
  const [syncing, setSyncing] = useState(false);

  const refreshCounts = useCallback(async () => {
    setPendingCount(await getPendingCount());
    setFailedCount(await getFailedCount());
    if (expanded) setItems(await getAll());
  }, [expanded]);

  useEffect(() => {
    refreshCounts();
    const interval = setInterval(refreshCounts, 3000);
    return () => clearInterval(interval);
  }, [refreshCounts]);

  const handleRetry = useCallback(async () => {
    setSyncing(true);
    await retryFailed();
    await refreshCounts();
    setSyncing(false);
  }, [refreshCounts]);

  const handleRemove = useCallback(async (id: string) => {
    await remove(id);
    await refreshCounts();
  }, [refreshCounts]);

  const totalCount = pendingCount + failedCount;
  const showBanner = !isOnline || totalCount > 0;

  if (!showBanner) return null;

  return (
    <Box sx={{
      bgcolor: alpha(!isOnline ? '#F59E0B' : '#EF4444', 0.12),
      borderBottom: 1,
      borderColor: alpha(!isOnline ? '#F59E0B' : '#EF4444', 0.3),
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.75 }}>
        <WifiOff sx={{ fontSize: 16, color: !isOnline ? '#F59E0B' : '#EF4444' }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400E', flex: 1 }}>
          {!isOnline ? 'Sem conexao' : `${failedCount} sincronizacao(oes) com erro`}
          {pendingCount > 0 && ` — ${pendingCount} pendente(s)`}
        </Typography>
        {failedCount > 0 && isOnline && (
          <Button
            size="small"
            startIcon={<Sync sx={{ fontSize: 14 }} />}
            onClick={handleRetry}
            disabled={syncing}
            sx={{ fontSize: '0.7rem', minWidth: 'auto', color: '#92400E' }}
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        )}
        {totalCount > 0 && (
          <IconButton size="small" onClick={() => setExpanded(!expanded)} sx={{ color: '#92400E' }}>
            {expanded ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
          </IconButton>
        )}
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 1 }}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.5,
                borderTop: 1,
                borderColor: alpha('#92400E', 0.15),
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: item.status === 'failed' ? '#EF4444' : item.status === 'syncing' ? '#3B82F6' : '#F59E0B',
                  flexShrink: 0,
                }}
              />
              <Typography sx={{ fontSize: '0.7rem', color: '#92400E', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.method.toUpperCase()} {item.url}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: alpha('#92400E', 0.6) }}>
                {item.status === 'failed' && item.lastError ? item.lastError.slice(0, 30) : item.status}
              </Typography>
              <IconButton size="small" onClick={() => handleRemove(item.id)} sx={{ p: 0.25, color: '#92400E' }}>
                <Delete sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
          {items.length === 0 && (
            <Typography sx={{ fontSize: '0.7rem', color: alpha('#92400E', 0.6), py: 0.5 }}>
              Nenhum item na fila
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
