import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  CircularProgress,
} from '@mui/material';
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
      <Box sx={{ height: '50vh', minHeight: 200, bgcolor: 'grey.200' }}>
        <iframe
          title="Mapa ao vivo"
          src={mapSrc}
          style={{ width: '100%', height: '100%', border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Usuarios online ({users.length})
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : users.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Nenhum usuario compartilhando localizacao
          </Typography>
        ) : (
          <Stack spacing={1}>
            {users.map((u) => (
              <Paper
                key={u.codusu}
                variant="outlined"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps?q=${u.lat},${u.lng}`,
                    '_blank',
                  );
                }}
                sx={{ p: 1.5, cursor: 'pointer', minHeight: 44 }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FuncionarioAvatar codparc={u.codparc} nome={u.nome} size="small" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.75rem' }}>
                      {u.nome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      {u.cargo ?? ''} {u.tempoDesde != null ? `- ${u.tempoDesde}s atras` : ''}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: (u.tempoDesde ?? 999) < 60 ? '#2e7d32' : '#ed6c02',
                      flexShrink: 0,
                    }}
                  />
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default MapaLivePage;
