import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  Skeleton,
} from '@mui/material';
import { LocationOn, SignalWifi4Bar, SignalWifiOff } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { getLocalizacoesAtivas } from '@/api/corridas';
import type { LocUser } from '@/types/corrida';

const POLL_INTERVAL = 15_000;

export function MapaLivePage() {
  const [users, setUsers] = useState<LocUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await getLocalizacoesAtivas();
      setUsers(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const centerLat = users.length > 0
    ? users.reduce((sum, u) => sum + u.lat, 0) / users.length
    : -18.9;
  const centerLng = users.length > 0
    ? users.reduce((sum, u) => sum + u.lng, 0) / users.length
    : -48.27;

  const mapSrc = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${centerLat},${centerLng}&zoom=13`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ height: '50vh', minHeight: 200, bgcolor: 'grey.200', position: 'relative' }}>
        <iframe
          title="Mapa ao vivo"
          src={mapSrc}
          style={{ width: '100%', height: '100%', border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Usuarios online
          </Typography>
          <Chip
            label={users.length}
            size="small"
            color={users.length > 0 ? 'success' : 'default'}
            sx={{ fontWeight: 700, minWidth: 28 }}
          />
        </Stack>

        {loading ? (
          <Stack spacing={1}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={60} />
            ))}
          </Stack>
        ) : users.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <LocationOn sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              Nenhum usuario compartilhando localizacao
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
              Ative o GPS no perfil para aparecer aqui
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {users.map((u) => {
              const isRecent = (u.tempoDesde ?? 999) < 60;
              const tempoLabel = u.tempoDesde != null
                ? u.tempoDesde < 60
                  ? `${u.tempoDesde}s`
                  : `${Math.floor(u.tempoDesde / 60)}min`
                : '';

              return (
                <Paper
                  key={u.codusu}
                  elevation={0}
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps?q=${u.lat},${u.lng}`,
                      '_blank',
                    );
                  }}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'background-color 0.15s',
                    '&:active': { bgcolor: 'action.selected' },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <FuncionarioAvatar codparc={u.codparc} nome={u.nome} size="medium" />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {u.nome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {u.cargo ?? ''}
                      </Typography>
                    </Box>
                    <Stack alignItems="flex-end" spacing={0.25}>
                      {isRecent ? (
                        <SignalWifi4Bar sx={{ fontSize: 16, color: 'success.main' }} />
                      ) : (
                        <SignalWifiOff sx={{ fontSize: 16, color: 'warning.main' }} />
                      )}
                      {tempoLabel && (
                        <Typography variant="caption" color={isRecent ? 'success.main' : 'warning.main'} sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                          {tempoLabel}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default MapaLivePage;
