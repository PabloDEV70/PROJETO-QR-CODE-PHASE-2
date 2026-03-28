import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import { Visibility, Share } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useMyRole } from '@/hooks/use-my-role';
import { useMinhasCorridas } from '@/hooks/use-corridas';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { CorridaCardRich } from '@/components/corrida/corrida-card-rich';
import { BUSCAR_LEVAR_LABELS } from '@/types/corrida';

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
  const corridaAtiva = ativas?.data?.[0] ?? null;
  const gpsActive = Boolean(localStorage.getItem('gps-sharing-active'));

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <FuncionarioAvatar codparc={user?.codparc} nome={user?.nome} size="large" />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body1" fontWeight={700} noWrap>
            {user?.nome ?? user?.username ?? 'Usuario'}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            {role?.cargo ?? user?.pertencedp ?? ''} {role?.departamento ? `- ${role.departamento}` : ''}
          </Typography>
        </Box>
        {gpsActive && (
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2e7d32', flexShrink: 0 }} />
        )}
      </Stack>

      {corridaAtiva && (
        <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} color="primary">
              Corrida Ativa
            </Typography>
            <Chip
              label={BUSCAR_LEVAR_LABELS[corridaAtiva.BUSCARLEVAR] ?? corridaAtiva.BUSCARLEVAR}
              size="small"
              sx={{ fontSize: 10, height: 20 }}
            />
          </Stack>

          <Typography variant="body1" fontWeight={700}>
            {corridaAtiva.NOMEPARC ?? corridaAtiva.DESTINO ?? 'Sem destino'}
          </Typography>

          {(corridaAtiva.ENDERECO || corridaAtiva.DESTINO) && (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {corridaAtiva.ENDERECO ?? corridaAtiva.DESTINO}
            </Typography>
          )}

          {corridaAtiva.TELEFONE && (
            <Typography
              component="a"
              href={`tel:${corridaAtiva.TELEFONE}`}
              variant="caption"
              display="block"
              color="primary"
              sx={{ fontSize: '0.75rem', textDecoration: 'none' }}
            >
              {corridaAtiva.TELEFONE}
            </Typography>
          )}

          {corridaAtiva.PASSAGEIROSMERCADORIA && (
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
              {corridaAtiva.PASSAGEIROSMERCADORIA}
            </Typography>
          )}

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
            <FuncionarioAvatar codparc={corridaAtiva.CODPARC_SOL ?? null} nome={corridaAtiva.NOMESOLICITANTE} size="small" />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.65rem' }}>
                {corridaAtiva.NOMESOLICITANTE}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                {corridaAtiva.SETOR ?? ''}
              </Typography>
            </Box>
          </Stack>

          {corridaAtiva.DESTINO && (
            <Box
              sx={{
                mt: 1.5,
                width: '100%',
                height: 120,
                borderRadius: 1,
                overflow: 'hidden',
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

          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Visibility />}
              onClick={() => navigate(`/corrida/${corridaAtiva.ID}`)}
              sx={{ minHeight: 44, fontWeight: 600 }}
            >
              Ver Corrida
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Share />}
              onClick={() => handleShare(corridaAtiva)}
              sx={{ minHeight: 44 }}
            >
              Compartilhar
            </Button>
          </Stack>
        </Paper>
      )}

      {(pendentes?.data?.length ?? 0) > 0 && (
        <>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Pendentes ({pendentes!.data.length})
          </Typography>
          <Stack spacing={1} sx={{ mb: 2 }}>
            {pendentes!.data.map((c) => (
              <CorridaCardRich key={c.ID} corrida={c} />
            ))}
          </Stack>
        </>
      )}

      {(!pendentes?.data?.length && !corridaAtiva) && (
        <Paper sx={{ p: 3, textAlign: 'center', mb: 2 }}>
          <Typography color="text.secondary" variant="body2">
            Nenhuma corrida pendente
          </Typography>
        </Paper>
      )}

      {recentes && recentes.data.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Recentes
          </Typography>
          <Stack spacing={0.5}>
            {recentes.data.map((c) => (
              <CorridaCardRich key={c.ID} corrida={c} compact />
            ))}
          </Stack>
        </>
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
