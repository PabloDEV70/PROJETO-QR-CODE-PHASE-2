import {
  Box, Paper, Typography, Stack, Chip, Button, CircularProgress,
} from '@mui/material';
import { DirectionsCar, CheckCircle, PlayArrow } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useCorridasList, useUpdateCorridaStatus } from '@/hooks/use-corridas';
import { STATUS_LABELS, STATUS_COLORS, BUSCAR_LEVAR_LABELS } from '@/types/corrida';
import { format } from 'date-fns';

export function MotoristaPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateStatus = useUpdateCorridaStatus();

  const { data: abertas, isLoading: loadA } = useCorridasList({
    motorista: user?.codusu,
    status: '0',
    limit: 50,
  });

  const { data: emAndamento, isLoading: loadE } = useCorridasList({
    motorista: user?.codusu,
    status: '1',
    limit: 50,
  });

  const { data: concluidas } = useCorridasList({
    motorista: user?.codusu,
    status: '2',
    limit: 10,
    orderBy: 'DT_FINISHED',
    orderDir: 'DESC',
  });

  const isLoading = loadA || loadE;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const allOpen = [...(emAndamento?.data ?? []), ...(abertas?.data ?? [])];

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <DirectionsCar color="primary" />
        <Typography variant="h6" fontWeight={700}>Minhas Entregas</Typography>
      </Stack>

      {allOpen.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Nenhuma corrida pendente atribuida a voce
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          {allOpen.map((c) => (
            <Paper key={c.ID} sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box
                  sx={{ flex: 1, cursor: 'pointer' }}
                  onClick={() => navigate(`/corridas/${c.ID}`)}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body1" fontWeight={700}>#{c.ID}</Typography>
                    <Chip
                      label={STATUS_LABELS[c.STATUS]}
                      size="small"
                      sx={{
                        bgcolor: `${STATUS_COLORS[c.STATUS]}18`,
                        color: STATUS_COLORS[c.STATUS],
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    {c.NOMEPARC ?? c.DESTINO ?? 'Sem destino'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {BUSCAR_LEVAR_LABELS[c.BUSCARLEVAR] ?? c.BUSCARLEVAR}
                    {c.PASSAGEIROSMERCADORIA ? ` · ${c.PASSAGEIROSMERCADORIA.slice(0, 60)}` : ''}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.disabled">
                    Solicitado por {c.NOMESOLICITANTE}
                    {c.DT_ACIONAMENTO ? ` · ${format(new Date(c.DT_ACIONAMENTO), 'dd/MM HH:mm')}` : ''}
                  </Typography>
                </Box>
                <Stack spacing={0.5}>
                  {c.STATUS === '0' && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => updateStatus.mutate({
                        id: c.ID, status: '1', codUsu: user?.codusu,
                      })}
                      disabled={updateStatus.isPending}
                    >
                      Iniciar
                    </Button>
                  )}
                  {c.STATUS === '1' && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => updateStatus.mutate({
                        id: c.ID, status: '2', codUsu: user?.codusu,
                      })}
                      disabled={updateStatus.isPending}
                    >
                      Concluir
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {concluidas && concluidas.data.length > 0 && (
        <>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Recentes Concluidas
          </Typography>
          <Stack spacing={1}>
            {concluidas.data.map((c) => (
              <Paper
                key={c.ID}
                variant="outlined"
                onClick={() => navigate(`/corridas/${c.ID}`)}
                sx={{ p: 1.5, cursor: 'pointer', opacity: 0.7 }}
              >
                <Typography variant="body2">
                  #{c.ID} - {c.NOMEPARC ?? c.DESTINO ?? '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {c.DT_FINISHED ? format(new Date(c.DT_FINISHED), 'dd/MM HH:mm') : ''}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
