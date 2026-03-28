import { Paper, Typography, Stack, Chip, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { Corrida } from '@/types/corrida';
import { STATUS_LABELS, STATUS_COLORS, BUSCAR_LEVAR_LABELS } from '@/types/corrida';

interface CorridaCardProps {
  corrida: Corrida;
  to?: string;
  showSolicitante?: boolean;
  showMotorista?: boolean;
  compact?: boolean;
}

export function CorridaCard({
  corrida,
  to,
  showSolicitante = false,
  showMotorista = false,
  compact = false,
}: CorridaCardProps) {
  const navigate = useNavigate();
  const c = corrida;

  const statusColor = STATUS_COLORS[c.STATUS] ?? '#757575';
  const statusLabel = STATUS_LABELS[c.STATUS] ?? c.STATUS;
  const tipoLabel = BUSCAR_LEVAR_LABELS[c.BUSCARLEVAR] ?? c.BUSCARLEVAR;
  const dest = c.NOMEPARC ?? c.DESTINO ?? 'Sem destino';

  const tempoStr = c.DT_FINISHED && c.DT_ACIONAMENTO
    ? formatTempo(new Date(c.DT_ACIONAMENTO), new Date(c.DT_FINISHED))
    : null;

  const handleClick = () => {
    if (to) navigate(to);
  };

  if (compact) {
    return (
      <Paper
        variant="outlined"
        onClick={handleClick}
        sx={{ p: 1.5, cursor: to ? 'pointer' : 'default', opacity: 0.85 }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" noWrap>
              #{c.ID} - {dest}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {tempoStr ?? ''} {c.DT_FINISHED ? format(new Date(c.DT_FINISHED), 'dd/MM HH:mm') : ''}
            </Typography>
          </Box>
          <Chip
            label={tipoLabel}
            size="small"
            sx={{ fontSize: 10, height: 20 }}
          />
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      onClick={handleClick}
      sx={{
        p: 2,
        cursor: to ? 'pointer' : 'default',
        '&:active': to ? { bgcolor: 'action.selected' } : undefined,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body1" fontWeight={700} noWrap>
            {dest}
          </Typography>
          {c.DESTINO && c.NOMEPARC && (
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              {c.DESTINO}
            </Typography>
          )}
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
            <Chip
              label={tipoLabel}
              size="small"
              sx={{ fontSize: 10, height: 22 }}
            />
            <Chip
              label={statusLabel}
              size="small"
              sx={{
                fontSize: 10,
                height: 22,
                bgcolor: `${statusColor}18`,
                color: statusColor,
                fontWeight: 600,
              }}
            />
          </Stack>
        </Box>

        <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap' }}>
          #{c.ID}
        </Typography>
      </Stack>

      {(showSolicitante || showMotorista) && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
          {showSolicitante && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <FuncionarioAvatar codparc={null} nome={c.NOMESOLICITANTE} size="small" />
              <Typography variant="caption" color="text.secondary" noWrap>
                {c.NOMESOLICITANTE}
              </Typography>
            </Stack>
          )}
          {showMotorista && c.NOMEMOTORISTA && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <FuncionarioAvatar codparc={null} nome={c.NOMEMOTORISTA} size="small" />
              <Typography variant="caption" color="text.secondary" noWrap>
                {c.NOMEMOTORISTA}
              </Typography>
            </Stack>
          )}
        </Stack>
      )}

      <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 0.5 }}>
        {c.DT_ACIONAMENTO ? format(new Date(c.DT_ACIONAMENTO), 'dd/MM HH:mm') : ''}
        {tempoStr ? ` · ${tempoStr}` : ''}
      </Typography>
    </Paper>
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
