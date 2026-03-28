import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Chip,
  alpha,
  Skeleton,
} from '@mui/material';
import {
  Visibility,
  Share,
  DirectionsCar,
  MyLocation,
  CallReceived,
  LocalShipping,
  SwapHoriz,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useMyRole } from '@/hooks/use-my-role';
import { useMinhasCorridas } from '@/hooks/use-corridas';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { CorridaCardRich } from '@/components/corrida/corrida-card-rich';
import { BUSCAR_LEVAR_LABELS, STATUS_COLORS } from '@/types/corrida';

const TIPO_ICONS: Record<string, React.ReactNode> = {
  '0': <CallReceived sx={{ fontSize: 18 }} />,
  '1': <LocalShipping sx={{ fontSize: 18 }} />,
  '3': <SwapHoriz sx={{ fontSize: 18 }} />,
};

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: role } = useMyRole();

  const { data: ativas, isLoading: loadAtivas } = useMinhasCorridas({
    role: 'motorista',
    status: '1',
    limit: 5,
  });

  const { data: pendentes, isLoading: loadPend } = useMinhasCorridas({
    status: '0',
    limit: 20,
  });

  const { data: recentes } = useMinhasCorridas({
    status: '2',
    limit: 5,
  });

  const isLoading = loadAtivas || loadPend;
  const corridaAtiva = ativas?.[0] ?? null;
  const gpsActive = Boolean(localStorage.getItem('gps-sharing-active'));

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <Skeleton variant="circular" width={52} height={52} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" height={24} />
            <Skeleton width="40%" height={16} />
          </Box>
        </Stack>
        <Skeleton variant="rounded" height={180} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={80} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={80} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <FuncionarioAvatar codparc={user?.codparc} nome={user?.nome} size="large" />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body1" fontWeight={700} noWrap>
              {user?.nome ?? user?.username ?? 'Usuario'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {role?.cargo ?? user?.pertencedp ?? ''}
              {role?.departamento ? ` - ${role.departamento}` : ''}
            </Typography>
          </Box>
          {gpsActive && (
            <Chip
              icon={<MyLocation sx={{ fontSize: 16 }} />}
              label="GPS"
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
            />
          )}
        </Stack>
      </Paper>

      {corridaAtiva && (
        <Paper
          elevation={0}
          sx={{
            mb: 2.5,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha(STATUS_COLORS['1'], 0.3),
            bgcolor: (theme) => alpha(STATUS_COLORS['1'], theme.palette.mode === 'dark' ? 0.08 : 0.02),
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 2,
              py: 1.25,
              bgcolor: (theme) => alpha(STATUS_COLORS['1'], theme.palette.mode === 'dark' ? 0.15 : 0.06),
            }}
          >
            <DirectionsCar sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ flex: 1 }}>
              Corrida Ativa
            </Typography>
            <Chip
              icon={TIPO_ICONS[corridaAtiva.BUSCARLEVAR] as React.ReactElement}
              label={BUSCAR_LEVAR_LABELS[corridaAtiva.BUSCARLEVAR] ?? corridaAtiva.BUSCARLEVAR}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.7rem', height: 26 }}
            />
          </Stack>

          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body1" fontWeight={700}>
              {corridaAtiva.NOMEPARC ?? corridaAtiva.DESTINO ?? 'Sem destino'}
            </Typography>

            {(corridaAtiva.ENDERECO || corridaAtiva.DESTINO) && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {corridaAtiva.ENDERECO ?? corridaAtiva.DESTINO}
              </Typography>
            )}

            {corridaAtiva.TELEFONE && (
              <Typography
                component="a"
                href={`tel:${corridaAtiva.TELEFONE}`}
                variant="body2"
                color="primary"
                sx={{ textDecoration: 'none', display: 'block', mt: 0.5 }}
              >
                {corridaAtiva.TELEFONE}
              </Typography>
            )}

            {corridaAtiva.PASSAGEIROSMERCADORIA && (
              <Typography variant="body2" sx={{ mt: 0.75, fontWeight: 600 }}>
                {corridaAtiva.PASSAGEIROSMERCADORIA}
              </Typography>
            )}

            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
              <FuncionarioAvatar codparc={corridaAtiva.CODPARC_SOL ?? null} nome={corridaAtiva.NOMESOLICITANTE} size="small" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                  {corridaAtiva.NOMESOLICITANTE}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {corridaAtiva.SETOR ?? ''}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {corridaAtiva.DESTINO && (
            <Box
              sx={{
                width: '100%',
                height: 140,
                bgcolor: 'grey.200',
              }}
            >
              <iframe
                title="Mapa corrida ativa"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(corridaAtiva.DESTINO)}&zoom=14`}
                style={{ width: '100%', height: '100%', border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Box>
          )}

          <Stack direction="row" spacing={1} sx={{ p: 2, pt: 1.5 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Visibility />}
              onClick={() => navigate(`/corrida/${corridaAtiva.ID}`)}
              sx={{ minHeight: 44, fontWeight: 700, textTransform: 'none' }}
            >
              Ver Corrida
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Share />}
              onClick={() => handleShare(corridaAtiva)}
              sx={{ minHeight: 44, textTransform: 'none' }}
            >
              Compartilhar
            </Button>
          </Stack>
        </Paper>
      )}

      {(pendentes?.length ?? 0) > 0 && (
        <Box sx={{ mb: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Pendentes
            </Typography>
            <Chip
              label={pendentes!.length}
              size="small"
              color="warning"
              sx={{ fontWeight: 700, minWidth: 28 }}
            />
          </Stack>
          <Stack spacing={1.5}>
            {pendentes!.map((c) => (
              <CorridaCardRich key={c.ID} corrida={c} />
            ))}
          </Stack>
        </Box>
      )}

      {(!pendentes?.length && !corridaAtiva) && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            mb: 2.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <DirectionsCar sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary" variant="body1" fontWeight={500}>
            Nenhuma corrida pendente
          </Typography>
          <Typography color="text.disabled" variant="body2" sx={{ mt: 0.5 }}>
            Novas corridas apareceram aqui
          </Typography>
        </Paper>
      )}

      {recentes && recentes.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
            Recentes
          </Typography>
          <Stack spacing={1}>
            {recentes.map((c) => (
              <CorridaCardRich key={c.ID} corrida={c} compact />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

function handleShare(corrida: { ID: number; NOMEPARC?: string | null; DESTINO?: string | null; BUSCARLEVAR: string; PASSAGEIROSMERCADORIA?: string | null }) {
  const tipo = BUSCAR_LEVAR_LABELS[corrida.BUSCARLEVAR] ?? corrida.BUSCARLEVAR;
  const text = [
    `Corrida #${corrida.ID}`,
    `Destino: ${corrida.NOMEPARC ?? ''} - ${corrida.DESTINO ?? ''}`,
    `${tipo}: ${corrida.PASSAGEIROSMERCADORIA ?? ''}`,
  ].join('\n');

  if (navigator.share) {
    navigator.share({ title: `Corrida #${corrida.ID}`, text }).catch(() => {});
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

export default HomePage;
