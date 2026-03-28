import { useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Navigation,
  Phone,
  Share,
  CheckCircle,
  PlayArrow,
  Cancel,
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

  const showActions = corrida.STATUS === '0' || corrida.STATUS === '1';

  const timeline = buildTimeline(corrida);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, py: 1 }}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBack />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
          #{corrida.ID}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: statusColor }}>
          {statusLabel}
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
          {tipoLabel}
        </Typography>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pb: showActions ? '120px' : 2 }}>
        {mapSrc && (
          <Box sx={{ width: '100%', height: 200, bgcolor: 'grey.200' }}>
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
          <Typography variant="body1" fontWeight={700}>
            {corrida.NOMEPARC ?? 'Sem parceiro'}
          </Typography>

          {corrida.ENDERECO && (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {corrida.ENDERECO}
              {corrida.BAIRRO ? `, ${corrida.BAIRRO}` : ''}
            </Typography>
          )}
          {(corrida.CIDADE || corrida.CEP) && (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {corrida.CIDADE ?? ''}{corrida.UF ? `/${corrida.UF}` : ''}{corrida.CEP ? ` - ${corrida.CEP}` : ''}
            </Typography>
          )}
          {!corrida.ENDERECO && corrida.DESTINO && (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {corrida.DESTINO}
            </Typography>
          )}

          {corrida.TELEFONE && (
            <Typography
              component="a"
              href={`tel:${corrida.TELEFONE}`}
              variant="caption"
              display="block"
              color="primary"
              sx={{ fontSize: '0.75rem', textDecoration: 'none', mt: 0.5 }}
            >
              {corrida.TELEFONE}
            </Typography>
          )}
          {corrida.EMAIL && (
            <Typography variant="caption" display="block" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
              {corrida.EMAIL}
            </Typography>
          )}

          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            {destAddr && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Navigation />}
                onClick={handleNavegar}
                sx={{ textTransform: 'none', fontSize: 12, minHeight: 44 }}
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
                sx={{ textTransform: 'none', fontSize: 12, minHeight: 44 }}
              >
                Ligar
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              startIcon={<Share />}
              onClick={handleCompartilhar}
              sx={{ textTransform: 'none', fontSize: 12, minHeight: 44 }}
            >
              Compartilhar
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {corrida.PASSAGEIROSMERCADORIA && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                Mercadoria / Passageiros
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                {corrida.PASSAGEIROSMERCADORIA}
              </Typography>
            </Box>
          )}

          {corrida.OBS && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                Observacoes
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                {corrida.OBS}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem', mb: 0.5 }}>
                Solicitante
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FuncionarioAvatar
                  codparc={corrida.CODPARC_SOL ?? null}
                  nome={corrida.NOMESOLICITANTE}
                  size="medium"
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.75rem' }}>
                    {corrida.NOMESOLICITANTE}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.6rem' }}>
                    {corrida.CARGO_SOL ?? ''} {corrida.SETOR ? `- ${corrida.SETOR}` : ''}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {corrida.NOMEMOTORISTA && (
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem', mb: 0.5 }}>
                  Motorista
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FuncionarioAvatar
                    codparc={corrida.CODPARC_MOT ?? null}
                    nome={corrida.NOMEMOTORISTA}
                    size="medium"
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.75rem' }}>
                      {corrida.NOMEMOTORISTA}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.6rem' }}>
                      {corrida.CARGO_MOT ?? 'Motorista'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem', mb: 1 }}>
            Timeline
          </Typography>
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
                    <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', minHeight: 20 }} />
                  )}
                </Box>
                <Box sx={{ pb: 1.5 }}>
                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.65rem' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                    {item.date ? format(new Date(item.date), 'dd/MM/yyyy HH:mm') : 'Pendente'}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>

          {gps.isTracking && gps.latitude && (
            <Paper variant="outlined" sx={{ p: 1.5, mt: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                GPS Ativo
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>
                {gps.latitude.toFixed(6)}, {gps.longitude?.toFixed(6)}
                {gps.accuracy ? ` (~${Math.round(gps.accuracy)}m)` : ''}
              </Typography>
            </Paper>
          )}

          {gps.error && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', fontSize: '0.65rem' }}>
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
              sx={{ minHeight: 48, fontWeight: 700, fontSize: 16, mb: 1 }}
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
                sx={{ minHeight: 48, fontWeight: 700, fontSize: 16 }}
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

          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<Cancel />}
            onClick={handleCancelar}
            disabled={updateStatus.isPending}
            sx={{ minHeight: 44, mt: 1 }}
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
