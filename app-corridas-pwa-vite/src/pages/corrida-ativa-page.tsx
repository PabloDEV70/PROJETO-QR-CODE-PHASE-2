import { useCallback } from 'react';
import {
  Box, Typography, Stack, Chip, Button, IconButton, CircularProgress, Paper, Divider,
} from '@mui/material';
import {
  ArrowBack, Navigation, Share, CheckCircle, PlayArrow, Map,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useCorridaById, useUpdateCorridaStatus } from '@/hooks/use-corridas';
import { useGpsTracking } from '@/hooks/use-gps-tracking';
import { useAuthStore } from '@/stores/auth-store';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { STATUS_LABELS, STATUS_COLORS, BUSCAR_LEVAR_LABELS } from '@/types/corrida';

export function CorridaAtivaPage() {
  const { id } = useParams<{ id: string }>();
  const corridaId = id ? Number(id) : null;
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: corrida, isLoading } = useCorridaById(corridaId);
  const updateStatus = useUpdateCorridaStatus();
  const gps = useGpsTracking(corridaId);

  const handleIniciar = useCallback(() => {
    if (!corridaId || !user?.codusu) return;
    updateStatus.mutate(
      { id: corridaId, status: '1', codUsu: user.codusu },
      { onSuccess: () => gps.startTracking() },
    );
  }, [corridaId, user?.codusu, updateStatus, gps]);

  const handleConcluir = useCallback(() => {
    if (!corridaId || !user?.codusu) return;
    updateStatus.mutate(
      { id: corridaId, status: '2', codUsu: user.codusu },
      { onSuccess: () => gps.stopTracking() },
    );
  }, [corridaId, user?.codusu, updateStatus, gps]);

  const handleNavegar = useCallback(() => {
    if (!corrida) return;
    const dest = corrida.DESTINO ?? corrida.NOMEPARC ?? '';
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
    window.open(url, '_blank');
  }, [corrida]);

  const handleCompartilhar = useCallback(async () => {
    if (!corrida) return;
    const tipo = BUSCAR_LEVAR_LABELS[corrida.BUSCARLEVAR] ?? corrida.BUSCARLEVAR;
    const locStr = gps.latitude && gps.longitude
      ? `https://maps.google.com/?q=${gps.latitude},${gps.longitude}`
      : 'GPS indisponivel';

    const text = [
      `Corrida #${corrida.ID}`,
      `Localizacao: ${locStr}`,
      `Destino: ${corrida.NOMEPARC ?? ''} - ${corrida.DESTINO ?? ''}`,
      `${tipo}: ${corrida.PASSAGEIROSMERCADORIA ?? ''}`,
    ].join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: `Corrida #${corrida.ID}`, text });
        return;
      } catch {
        // user cancelled or not supported
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [corrida, gps.latitude, gps.longitude]);

  if (isLoading || !corrida) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  const statusColor = STATUS_COLORS[corrida.STATUS] ?? '#757575';
  const statusLabel = STATUS_LABELS[corrida.STATUS] ?? corrida.STATUS;
  const tipoLabel = BUSCAR_LEVAR_LABELS[corrida.BUSCARLEVAR] ?? corrida.BUSCARLEVAR;
  const destAddr = corrida.DESTINO ?? corrida.NOMEPARC ?? '';

  const mapSrc = destAddr
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(destAddr)}&zoom=14`
    : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, py: 1 }}>
        <IconButton onClick={() => navigate('/motorista')} size="small">
          <ArrowBack />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700}>
          Corrida #{corrida.ID}
        </Typography>
        <Chip
          label={statusLabel}
          size="small"
          sx={{ bgcolor: `${statusColor}18`, color: statusColor, fontWeight: 600, fontSize: 11 }}
        />
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pb: '100px' }}>
        {mapSrc && (
          <Box sx={{ width: '100%', height: '40vh', minHeight: 200, bgcolor: 'grey.200' }}>
            <iframe
              title="Mapa destino"
              src={mapSrc}
              style={{ width: '100%', height: '100%', border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Box>
        )}

        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {corrida.NOMEPARC ?? 'Sem parceiro'}
          </Typography>
          {corrida.DESTINO && (
            <Typography variant="body2" color="text.secondary">
              {corrida.DESTINO}
            </Typography>
          )}

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip label={tipoLabel} size="small" />
            {destAddr && (
              <Button
                size="small"
                startIcon={<Map />}
                onClick={handleNavegar}
                sx={{ textTransform: 'none', fontSize: 12 }}
              >
                Rota
              </Button>
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          {corrida.PASSAGEIROSMERCADORIA && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Mercadoria / Passageiros
              </Typography>
              <Typography variant="body2">
                {corrida.PASSAGEIROSMERCADORIA}
              </Typography>
            </Box>
          )}

          {corrida.OBS && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Observacoes
              </Typography>
              <Typography variant="body2">
                {corrida.OBS}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" alignItems="center" spacing={1.5}>
            <FuncionarioAvatar codparc={null} nome={corrida.NOMESOLICITANTE} size="medium" />
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {corrida.NOMESOLICITANTE}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Solicitante {corrida.SETOR ? `· ${corrida.SETOR}` : ''}
              </Typography>
            </Box>
          </Stack>

          {gps.isTracking && gps.latitude && (
            <Paper variant="outlined" sx={{ p: 1.5, mt: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                GPS Ativo
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                {gps.latitude.toFixed(6)}, {gps.longitude?.toFixed(6)}
                {gps.accuracy ? ` (~${Math.round(gps.accuracy)}m)` : ''}
              </Typography>
            </Paper>
          )}

          {gps.error && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              GPS: {gps.error}
            </Typography>
          )}
        </Box>
      </Box>

      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          zIndex: 20,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {corrida.STATUS === '0' && (
          <Button
            variant="contained"
            color="success"
            fullWidth
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleIniciar}
            disabled={updateStatus.isPending}
            sx={{ minHeight: 52, fontWeight: 700, fontSize: 16 }}
          >
            {updateStatus.isPending ? 'Iniciando...' : 'Iniciar Corrida'}
          </Button>
        )}

        {corrida.STATUS === '1' && (
          <Stack spacing={1}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              size="large"
              startIcon={<CheckCircle />}
              onClick={handleConcluir}
              disabled={updateStatus.isPending}
              sx={{ minHeight: 52, fontWeight: 700, fontSize: 16 }}
            >
              {updateStatus.isPending ? 'Concluindo...' : 'Concluir'}
            </Button>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="info"
                fullWidth
                startIcon={<Share />}
                onClick={handleCompartilhar}
                sx={{ minHeight: 44 }}
              >
                Compartilhar
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Navigation />}
                onClick={handleNavegar}
                sx={{ minHeight: 44 }}
              >
                Navegar
              </Button>
            </Stack>
          </Stack>
        )}

        {corrida.STATUS === '2' && (
          <Button
            variant="contained"
            fullWidth
            size="large"
            disabled
            sx={{ minHeight: 52 }}
          >
            Corrida Concluida
          </Button>
        )}

        {corrida.STATUS === '3' && (
          <Button
            variant="contained"
            color="error"
            fullWidth
            size="large"
            disabled
            sx={{ minHeight: 52 }}
          >
            Corrida Cancelada
          </Button>
        )}
      </Paper>
    </Box>
  );
}
