import {
  Box, Typography, Stack, Chip, IconButton, CircularProgress, Divider, Paper,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useCorridaById } from '@/hooks/use-corridas';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { STATUS_LABELS, STATUS_COLORS, BUSCAR_LEVAR_LABELS } from '@/types/corrida';

export function CorridaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const corridaId = id ? Number(id) : null;
  const navigate = useNavigate();
  const { data: corrida, isLoading } = useCorridaById(corridaId);

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

  const tempoStr = corrida.DT_FINISHED && corrida.DT_ACIONAMENTO
    ? formatTempo(new Date(corrida.DT_ACIONAMENTO), new Date(corrida.DT_FINISHED))
    : null;

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBack />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700}>
          Corrida #{corrida.ID}
        </Typography>
        <Chip
          label={statusLabel}
          size="small"
          sx={{ bgcolor: `${statusColor}18`, color: statusColor, fontWeight: 600 }}
        />
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
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
          {corrida.PRIORIDADE && (
            <Chip label={`Prioridade: ${corrida.PRIORIDADE}`} size="small" variant="outlined" />
          )}
        </Stack>
      </Paper>

      {corrida.PASSAGEIROSMERCADORIA && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Mercadoria / Passageiros
          </Typography>
          <Typography variant="body2">
            {corrida.PASSAGEIROSMERCADORIA}
          </Typography>
        </Paper>
      )}

      {corrida.OBS && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Observacoes
          </Typography>
          <Typography variant="body2">
            {corrida.OBS}
          </Typography>
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Solicitante
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FuncionarioAvatar codparc={null} nome={corrida.NOMESOLICITANTE} size="medium" />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {corrida.NOMESOLICITANTE}
            </Typography>
            {corrida.SETOR && (
              <Typography variant="caption" color="text.secondary">
                {corrida.SETOR}
              </Typography>
            )}
          </Box>
        </Stack>

        {corrida.NOMEMOTORISTA && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Motorista
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <FuncionarioAvatar codparc={null} nome={corrida.NOMEMOTORISTA} size="medium" />
              <Typography variant="body2" fontWeight={600}>
                {corrida.NOMEMOTORISTA}
              </Typography>
            </Stack>
          </>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Datas
        </Typography>
        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
          {corrida.DT_ACIONAMENTO && (
            <Typography variant="body2">
              Acionamento: {format(new Date(corrida.DT_ACIONAMENTO), 'dd/MM/yyyy HH:mm')}
            </Typography>
          )}
          {corrida.DT_CREATED && (
            <Typography variant="body2">
              Criado: {format(new Date(corrida.DT_CREATED), 'dd/MM/yyyy HH:mm')}
            </Typography>
          )}
          {corrida.DT_FINISHED && (
            <Typography variant="body2">
              Concluido: {format(new Date(corrida.DT_FINISHED), 'dd/MM/yyyy HH:mm')}
            </Typography>
          )}
          {tempoStr && (
            <Typography variant="body2" fontWeight={600}>
              Tempo total: {tempoStr}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

function formatTempo(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h${remainMins > 0 ? `${remainMins}m` : ''}`;
}
