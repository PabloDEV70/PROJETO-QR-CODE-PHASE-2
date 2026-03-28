import { useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Paper,
  Chip,
  alpha,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  Navigation,
  Phone,
  Share,
  CheckCircle,
  PlayArrow,
  Cancel,
  AccessTime,
  Inventory,
  StickyNote2,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useCorridaById, useUpdateCorridaStatus } from '@/hooks/use-corridas';
import { useGpsTracking } from '@/hooks/use-gps-tracking';
import { useAuthStore } from '@/stores/auth-store';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { STATUS_LABELS, STATUS_COLORS, BUSCAR_LEVAR_LABELS } from '@/types/corrida';

export function CorridaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const corridaId = id ? Number(id) : null;
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: corrida, isLoading } = useCorridaById(corridaId);
  const updateStatus = useUpdateCorridaStatus();
  const gps = useGpsTracking(corridaId);

  const isMotorista = corrida && user?.codusu === corrida.USU_MOTORISTA;

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

  const handleCancelar = useCallback(() => {
    if (!corridaId || !user?.codusu) return;
    updateStatus.mutate({ id: corridaId, status: '3', codUsu: user.codusu });
  }, [corridaId, user?.codusu, updateStatus]);

  const handleNavegar = useCallback(() => {
    if (!corrida) return;
    const dest = corrida.DESTINO ?? corrida.NOMEPARC ?? '';
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`,
      '_blank',
    );
  }, [corrida]);

  const handleCompartilhar = useCallback(async () => {
    if (!corrida) return;
    const tipo = BUSCAR_LEVAR_LABELS[corrida.BUSCARLEVAR] ?? corrida.BUSCARLEVAR;
    const locStr =
      gps.latitude && gps.longitude
        ? `https://maps.google.com/?q=${gps.latitude},${gps.longitude}`
        : '';

    const text = [
      `Corrida #${corrida.ID}`,
      `Destino: ${corrida.NOMEPARC ?? ''} - ${corrida.DESTINO ?? ''}`,
      `${tipo}: ${corrida.PASSAGEIROSMERCADORIA ?? ''}`,
      locStr ? `Localizacao: ${locStr}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: `Corrida #${corrida.ID}`, text });
        return;
      } catch {
        // cancelled
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [corrida, gps.latitude, gps.longitude]);

  if (isLoading || !corrida) {
    return (
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton width={100} height={28} />
        </Stack>
        <Skeleton variant="rounded" height={200} sx={{ mb: 2 }} />
        <Skeleton width="80%" height={24} sx={{ mb: 1 }} />
        <Skeleton width="60%" height={20} />
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

  const showActions = corrida.STATUS === '0' || corrida.STATUS === '1';
  const timeline = buildTimeline(corrida);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 1,
          py: 1,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBack />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700}>
          #{corrida.ID}
        </Typography>
        <Chip
          label={statusLabel}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.7rem',
            height: 24,
            bgcolor: alpha(statusColor, 0.1),
            color: statusColor,
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto !important' }}>
          {tipoLabel}
        </Typography>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pb: showActions ? '140px' : 2 }}>
        {mapSrc && (
          <Box sx={{ width: '100%', height: 220, bgcolor: 'grey.200' }}>
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

          {corrida.ENDERECO && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {corrida.ENDERECO}
              {corrida.BAIRRO ? `, ${corrida.BAIRRO}` : ''}
            </Typography>
          )}
          {(corrida.CIDADE || corrida.CEP) && (
            <Typography variant="body2" color="text.secondary">
              {corrida.CIDADE ?? ''}{corrida.UF ? `/${corrida.UF}` : ''}{corrida.CEP ? ` - ${corrida.CEP}` : ''}
            </Typography>
          )}
          {!corrida.ENDERECO && corrida.DESTINO && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {corrida.DESTINO}
            </Typography>
          )}

          {corrida.TELEFONE && (
            <Typography
              component="a"
              href={`tel:${corrida.TELEFONE}`}
              variant="body2"
              color="primary"
              fontWeight={600}
              sx={{ textDecoration: 'none', display: 'block', mt: 0.75 }}
            >
              {corrida.TELEFONE}
            </Typography>
          )}
          {corrida.EMAIL && (
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.25 }}>
              {corrida.EMAIL}
            </Typography>
          )}

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            {destAddr && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Navigation />}
                onClick={handleNavegar}
                sx={{ textTransform: 'none', minHeight: 40, fontWeight: 600, flex: 1 }}
              >
                Rota
              </Button>
            )}
            {corrida.TELEFONE && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Phone />}
                component="a"
                href={`tel:${corrida.TELEFONE}`}
                sx={{ textTransform: 'none', minHeight: 40, fontWeight: 600, flex: 1 }}
              >
                Ligar
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              startIcon={<Share />}
              onClick={handleCompartilhar}
              sx={{ textTransform: 'none', minHeight: 40, fontWeight: 600, flex: 1 }}
            >
              Compartilhar
            </Button>
          </Stack>

          {corrida.PASSAGEIROSMERCADORIA && (
            <Paper
              variant="outlined"
              sx={{ p: 1.5, mt: 2.5 }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Inventory sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Mercadoria / Passageiros
                </Typography>
              </Stack>
              <Typography variant="body2">
                {corrida.PASSAGEIROSMERCADORIA}
              </Typography>
            </Paper>
          )}

          {corrida.OBS && (
            <Paper
              variant="outlined"
              sx={{ p: 1.5, mt: 1.5 }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <StickyNote2 sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Observacoes
                </Typography>
              </Stack>
              <Typography variant="body2">
                {corrida.OBS}
              </Typography>
            </Paper>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 2.5 }}>
            <Paper variant="outlined" sx={{ flex: 1, p: 1.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 1 }}>
                Solicitante
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FuncionarioAvatar
                  codparc={corrida.CODPARC_SOL ?? null}
                  nome={corrida.NOMESOLICITANTE}
                  size="medium"
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {corrida.NOMESOLICITANTE}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {corrida.CARGO_SOL ?? ''} {corrida.SETOR ? `- ${corrida.SETOR}` : ''}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {corrida.NOMEMOTORISTA && (
              <Paper variant="outlined" sx={{ flex: 1, p: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 1 }}>
                  Motorista
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FuncionarioAvatar
                    codparc={corrida.CODPARC_MOT ?? null}
                    nome={corrida.NOMEMOTORISTA}
                    size="medium"
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {corrida.NOMEMOTORISTA}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {corrida.CARGO_MOT ?? 'Motorista'}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
          </Stack>

          <Paper variant="outlined" sx={{ p: 1.5, mt: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Timeline
              </Typography>
            </Stack>
            <Stack spacing={0}>
              {timeline.map((item, idx) => (
                <Stack key={item.label} direction="row" alignItems="flex-start" spacing={1.5}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: item.date ? 'primary.main' : 'grey.300',
                        flexShrink: 0,
                      }}
                    />
                    {idx < timeline.length - 1 && (
                      <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', minHeight: 24 }} />
                    )}
                  </Box>
                  <Box sx={{ pb: 2 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" color={item.date ? 'text.secondary' : 'text.disabled'}>
                      {item.date ? format(new Date(item.date), 'dd/MM/yyyy HH:mm') : 'Pendente'}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Paper>

          {gps.isTracking && gps.latitude && (
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                mt: 2,
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.04),
                borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.4 },
                      '100%': { opacity: 1 },
                    },
                  }}
                />
                <Typography variant="body2" fontWeight={600} color="success.main">
                  GPS Ativo
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                {gps.latitude.toFixed(6)}, {gps.longitude?.toFixed(6)}
                {gps.accuracy ? ` (~${Math.round(gps.accuracy)}m)` : ''}
              </Typography>
            </Paper>
          )}

          {gps.error && (
            <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
              GPS: {gps.error}
            </Typography>
          )}
        </Box>
      </Box>

      {showActions && (
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
          {corrida.STATUS === '0' && isMotorista && (
            <Button
              variant="contained"
              color="success"
              fullWidth
              size="large"
              startIcon={<PlayArrow />}
              onClick={handleIniciar}
              disabled={updateStatus.isPending}
              sx={{ minHeight: 52, fontWeight: 700, fontSize: 16, mb: 1, textTransform: 'none' }}
            >
              {updateStatus.isPending ? 'Iniciando...' : 'Iniciar Corrida'}
            </Button>
          )}

          {corrida.STATUS === '1' && isMotorista && (
            <Stack spacing={1}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                startIcon={<CheckCircle />}
                onClick={handleConcluir}
                disabled={updateStatus.isPending}
                sx={{ minHeight: 52, fontWeight: 700, fontSize: 16, textTransform: 'none' }}
              >
                {updateStatus.isPending ? 'Concluindo...' : 'Concluir Corrida'}
              </Button>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="info"
                  fullWidth
                  startIcon={<Share />}
                  onClick={handleCompartilhar}
                  sx={{ minHeight: 44, textTransform: 'none' }}
                >
                  Compartilhar
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Navigation />}
                  onClick={handleNavegar}
                  sx={{ minHeight: 44, textTransform: 'none' }}
                >
                  Navegar
                </Button>
              </Stack>
            </Stack>
          )}

          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<Cancel />}
            onClick={handleCancelar}
            disabled={updateStatus.isPending}
            sx={{ minHeight: 44, mt: 1, textTransform: 'none' }}
          >
            Cancelar
          </Button>
        </Paper>
      )}
    </Box>
  );
}

function buildTimeline(corrida: {
  DT_ACIONAMENTO: string | null;
  DT_CREATED: string;
  DT_UPDATED: string | null;
  DT_FINISHED: string | null;
}) {
  return [
    { label: 'Acionamento', date: corrida.DT_ACIONAMENTO },
    { label: 'Criado', date: corrida.DT_CREATED },
    { label: 'Atualizado', date: corrida.DT_UPDATED },
    { label: 'Finalizado', date: corrida.DT_FINISHED },
  ];
}

export default CorridaDetailPage;
