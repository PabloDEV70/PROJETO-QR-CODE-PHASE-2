import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Stack, Chip, Button, Skeleton,
  IconButton, MenuItem, TextField,
} from '@mui/material';
import {
  ArrowBack, DirectionsCar, Person, Business, AccessTime,
  CheckCircle, Cancel, HourglassEmpty, PlayArrow,
} from '@mui/icons-material';
import { useState } from 'react';
import { useCorridaById, useUpdateCorridaStatus, useAssignMotorista, useMotoristas } from '@/hooks/use-corridas';
import { useAuthStore } from '@/stores/auth-store';
import { STATUS_LABELS, STATUS_COLORS, BUSCAR_LEVAR_LABELS } from '@/types/corrida';
import { format } from 'date-fns';

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 0.75 }}>
      <Box sx={{ color: 'text.secondary', mt: 0.25 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2">{value}</Typography>
      </Box>
    </Stack>
  );
}

export function CorridaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: corrida, isLoading } = useCorridaById(id ? Number(id) : null);
  const { data: motoristas } = useMotoristas();
  const updateStatus = useUpdateCorridaStatus();
  const assignMot = useAssignMotorista();
  const [showAssign, setShowAssign] = useState(false);
  const [selectedMotorista, setSelectedMotorista] = useState('');

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton height={40} />
        <Skeleton height={200} variant="rounded" sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!corrida) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">Corrida nao encontrada</Typography>
      </Box>
    );
  }

  const canChangeStatus = corrida.STATUS === '0' || corrida.STATUS === '1';
  const fmt = (d: string | null) => d ? format(new Date(d), 'dd/MM/yyyy HH:mm') : '-';

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          Corrida #{corrida.ID}
        </Typography>
        <Chip
          label={STATUS_LABELS[corrida.STATUS] ?? corrida.STATUS}
          sx={{
            bgcolor: `${STATUS_COLORS[corrida.STATUS] ?? '#999'}18`,
            color: STATUS_COLORS[corrida.STATUS] ?? '#999',
            fontWeight: 700,
          }}
        />
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <InfoRow
          icon={<Person fontSize="small" />}
          label="Solicitante"
          value={corrida.NOMESOLICITANTE}
        />
        <InfoRow
          icon={<DirectionsCar fontSize="small" />}
          label="Motorista"
          value={corrida.NOMEMOTORISTA ?? 'Nao atribuido'}
        />
        <InfoRow
          icon={<Business fontSize="small" />}
          label="Parceiro / Destino"
          value={corrida.NOMEPARC ?? corrida.DESTINO ?? '-'}
        />
        <InfoRow
          icon={<DirectionsCar fontSize="small" />}
          label="Tipo"
          value={BUSCAR_LEVAR_LABELS[corrida.BUSCARLEVAR] ?? corrida.BUSCARLEVAR}
        />
        {corrida.PASSAGEIROSMERCADORIA && (
          <InfoRow
            icon={<Business fontSize="small" />}
            label="Passageiros / Mercadoria"
            value={corrida.PASSAGEIROSMERCADORIA}
          />
        )}
        {corrida.OBS && (
          <InfoRow
            icon={<Business fontSize="small" />}
            label="Observacao"
            value={corrida.OBS}
          />
        )}
        {corrida.SETOR && (
          <InfoRow
            icon={<Person fontSize="small" />}
            label="Setor"
            value={corrida.SETOR}
          />
        )}
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Datas
        </Typography>
        <InfoRow
          icon={<AccessTime fontSize="small" />}
          label="Acionamento"
          value={fmt(corrida.DT_ACIONAMENTO)}
        />
        <InfoRow
          icon={<HourglassEmpty fontSize="small" />}
          label="Criacao"
          value={fmt(corrida.DT_CREATED)}
        />
        <InfoRow
          icon={<AccessTime fontSize="small" />}
          label="Ultima Atualizacao"
          value={fmt(corrida.DT_UPDATED)}
        />
        {corrida.DT_FINISHED && (
          <InfoRow
            icon={<CheckCircle fontSize="small" />}
            label="Finalizacao"
            value={fmt(corrida.DT_FINISHED)}
          />
        )}
        {corrida.DT_CREATED && corrida.DT_FINISHED && (
          <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Tempo total:{' '}
              <strong>
                {Math.round(
                  (new Date(corrida.DT_FINISHED).getTime() - new Date(corrida.DT_CREATED).getTime()) / 60000,
                )} min
              </strong>
            </Typography>
          </Box>
        )}
      </Paper>

      {canChangeStatus && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
            Acoes
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {corrida.STATUS === '0' && (
              <>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PlayArrow />}
                  onClick={() => updateStatus.mutate({
                    id: corrida.ID,
                    status: '1',
                    codUsu: user?.codusu,
                  })}
                  disabled={updateStatus.isPending}
                >
                  Iniciar
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowAssign(!showAssign)}
                >
                  Atribuir Motorista
                </Button>
              </>
            )}
            {corrida.STATUS === '1' && (
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<CheckCircle />}
                onClick={() => updateStatus.mutate({
                  id: corrida.ID,
                  status: '2',
                  codUsu: user?.codusu,
                })}
                disabled={updateStatus.isPending}
              >
                Concluir
              </Button>
            )}
            {(corrida.STATUS === '0' || corrida.STATUS === '1') && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<Cancel />}
                onClick={() => updateStatus.mutate({
                  id: corrida.ID,
                  status: '3',
                  codUsu: user?.codusu,
                })}
                disabled={updateStatus.isPending}
              >
                Cancelar
              </Button>
            )}
          </Stack>

          {showAssign && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }} alignItems="center">
              <TextField
                select
                size="small"
                label="Motorista"
                value={selectedMotorista}
                onChange={(e) => setSelectedMotorista(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                {motoristas?.map((m) => (
                  <MenuItem key={m.CODUSU} value={String(m.CODUSU)}>{m.NOMEUSU}</MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                size="small"
                disabled={!selectedMotorista || assignMot.isPending}
                onClick={() => {
                  assignMot.mutate({ id: corrida.ID, codUsu: Number(selectedMotorista) });
                  setShowAssign(false);
                }}
              >
                Atribuir
              </Button>
            </Stack>
          )}
        </Paper>
      )}
    </Box>
  );
}
