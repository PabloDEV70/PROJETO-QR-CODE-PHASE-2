import { Paper, Typography, Stack, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { Corrida } from '@/types/corrida';
import { STATUS_LABELS, STATUS_COLORS, BUSCAR_LEVAR_LABELS } from '@/types/corrida';

interface CorridaCardRichProps {
  corrida: Corrida;
  showMotorista?: boolean;
  showSolicitante?: boolean;
  compact?: boolean;
}

export function CorridaCardRich({
  corrida,
  showMotorista = true,
  showSolicitante = true,
  compact = false,
}: CorridaCardRichProps) {
  const navigate = useNavigate();
  const c = corrida;

  const statusColor = STATUS_COLORS[c.STATUS] ?? '#757575';
  const statusLabel = STATUS_LABELS[c.STATUS] ?? c.STATUS;
  const tipoLabel = BUSCAR_LEVAR_LABELS[c.BUSCARLEVAR] ?? c.BUSCARLEVAR;
  const parceiro = c.NOMEPARC ?? 'Sem parceiro';
  const address = buildAddress(c);
  const phone = c.TELEFONE ?? null;

  const tempoStr = c.DT_FINISHED && c.DT_ACIONAMENTO
    ? formatTempo(new Date(c.DT_ACIONAMENTO), new Date(c.DT_FINISHED))
    : c.DT_CREATED
      ? formatTempoDesde(new Date(c.DT_CREATED))
      : null;

  if (compact) {
    return (
      <Paper
        variant="outlined"
        onClick={() => navigate(`/corrida/${c.ID}`)}
        sx={{ p: 1.5, cursor: 'pointer', opacity: 0.85, minHeight: 44 }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" noWrap sx={{ fontSize: '0.75rem' }}>
              #{c.ID} - {parceiro}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {tempoStr ?? ''} {c.DT_FINISHED ? format(new Date(c.DT_FINISHED), 'dd/MM HH:mm') : ''}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      onClick={() => navigate(`/corrida/${c.ID}`)}
      sx={{
        p: 1.5,
        cursor: 'pointer',
        '&:active': { bgcolor: 'action.selected' },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
          #{c.ID}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: statusColor }}>
          {statusLabel}
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
          {tipoLabel}
        </Typography>
        {tempoStr && (
          <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', ml: 'auto !important' }}>
            {tempoStr}
          </Typography>
        )}
      </Stack>

      <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '0.75rem' }}>
        {parceiro}
      </Typography>

      {(address || c.DESTINO) && (
        <Typography variant="caption" display="block" color="text.secondary" noWrap sx={{ fontSize: '0.65rem' }}>
          {address || c.DESTINO}
        </Typography>
      )}

      {phone && (
        <Typography variant="caption" display="block" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
          {phone}
        </Typography>
      )}

      {c.PASSAGEIROSMERCADORIA && (
        <Typography variant="caption" display="block" sx={{ fontSize: '0.75rem', mt: 0.5 }} noWrap>
          {c.PASSAGEIROSMERCADORIA}
        </Typography>
      )}

      {(showSolicitante || showMotorista) && (
        <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
          {showSolicitante && (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
              <FuncionarioAvatar codparc={c.CODPARC_SOL ?? null} nome={c.NOMESOLICITANTE} size="small" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" display="block" fontWeight={600} noWrap sx={{ fontSize: '0.65rem' }}>
                  {c.NOMESOLICITANTE}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" noWrap sx={{ fontSize: '0.6rem' }}>
                  {c.CARGO_SOL ?? c.SETOR ?? ''}
                </Typography>
              </Box>
            </Stack>
          )}
          {showMotorista && c.NOMEMOTORISTA && (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
              <FuncionarioAvatar codparc={c.CODPARC_MOT ?? null} nome={c.NOMEMOTORISTA} size="small" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" display="block" fontWeight={600} noWrap sx={{ fontSize: '0.65rem' }}>
                  {c.NOMEMOTORISTA}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" noWrap sx={{ fontSize: '0.6rem' }}>
                  {c.CARGO_MOT ?? 'Motorista'}
                </Typography>
              </Box>
            </Stack>
          )}
        </Stack>
      )}
    </Paper>
  );
}

function buildAddress(c: Corrida): string {
  const parts: string[] = [];
  if (c.ENDERECO) parts.push(c.ENDERECO);
  if (c.BAIRRO) parts.push(c.BAIRRO);
  return parts.join(', ');
}

function formatTempo(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h${remainMins > 0 ? `${remainMins}m` : ''}`;
}

function formatTempoDesde(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  return `${hours}h`;
}
