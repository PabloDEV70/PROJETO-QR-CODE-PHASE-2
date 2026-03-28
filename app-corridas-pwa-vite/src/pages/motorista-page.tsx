import {
  Box, Typography, Stack, Paper, Chip, Button, CircularProgress, Divider,
} from '@mui/material';
import { Visibility, DirectionsCar } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMinhasCorridas } from '@/hooks/use-corridas';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { CorridaCard } from '@/components/corrida/corrida-card';
import { BUSCAR_LEVAR_LABELS, STATUS_COLORS } from '@/types/corrida';

export function MotoristaPage() {
  const navigate = useNavigate();

  const { data: emAndamento, isLoading: loadActive } = useMinhasCorridas({
    role: 'motorista',
    status: '1',
    limit: 5,
  });

  const { data: pendentes, isLoading: loadPend } = useMinhasCorridas({
    role: 'motorista',
    status: '0',
    limit: 20,
  });

  const { data: recentes } = useMinhasCorridas({
    role: 'motorista',
    status: '2',
    limit: 5,
  });

  const isLoading = loadActive || loadPend;
  const ativa = emAndamento?.data?.[0] ?? null;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      {ativa && (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            bgcolor: `${STATUS_COLORS['1']}08`,
            border: '1px solid',
            borderColor: `${STATUS_COLORS['1']}30`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <DirectionsCar sx={{ color: STATUS_COLORS['1'] }} />
            <Typography variant="subtitle2" fontWeight={700} color="primary">
              Corrida Ativa
            </Typography>
            <Chip
              label="Em Andamento"
              size="small"
              sx={{ bgcolor: `${STATUS_COLORS['1']}18`, color: STATUS_COLORS['1'], fontWeight: 600, fontSize: 10 }}
            />
          </Stack>

          <Typography variant="h6" fontWeight={700}>
            {ativa.NOMEPARC ?? ativa.DESTINO ?? 'Sem destino'}
          </Typography>
          {ativa.DESTINO && (
            <Typography variant="body2" color="text.secondary">
              {ativa.DESTINO}
            </Typography>
          )}

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip label={BUSCAR_LEVAR_LABELS[ativa.BUSCARLEVAR] ?? ativa.BUSCARLEVAR} size="small" />
            {ativa.PASSAGEIROSMERCADORIA && (
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                {ativa.PASSAGEIROSMERCADORIA.slice(0, 80)}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
            <FuncionarioAvatar codparc={null} nome={ativa.NOMESOLICITANTE} size="small" />
            <Typography variant="caption" color="text.secondary">
              {ativa.NOMESOLICITANTE}
            </Typography>
          </Stack>

          <Button
            variant="contained"
            fullWidth
            startIcon={<Visibility />}
            onClick={() => navigate(`/motorista/corrida/${ativa.ID}`)}
            sx={{ mt: 2, minHeight: 44 }}
          >
            Ver Corrida
          </Button>
        </Paper>
      )}

      {(emAndamento?.data?.length ?? 0) > 1 && (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {emAndamento!.data.slice(1).map((c) => (
            <CorridaCard
              key={c.ID}
              corrida={c}
              to={`/motorista/corrida/${c.ID}`}
              showSolicitante
            />
          ))}
        </Stack>
      )}

      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Pendentes
      </Typography>

      {(!pendentes?.data || pendentes.data.length === 0) ? (
        <Paper sx={{ p: 3, textAlign: 'center', mb: 2 }}>
          <Typography color="text.secondary" variant="body2">
            Nenhuma corrida pendente
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {pendentes.data.map((c) => (
            <CorridaCard
              key={c.ID}
              corrida={c}
              to={`/motorista/corrida/${c.ID}`}
              showSolicitante
            />
          ))}
        </Stack>
      )}

      {recentes && recentes.data.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Recentes
          </Typography>
          <Stack spacing={0.5}>
            {recentes.data.map((c) => (
              <CorridaCard key={c.ID} corrida={c} compact to={`/motorista/corrida/${c.ID}`} />
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
