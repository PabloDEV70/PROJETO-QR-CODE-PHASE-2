import { Paper, Typography, Stack, Box, Chip, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  AccessTime,
  LocalShipping,
  CallReceived,
  SwapHoriz,
} from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { Corrida } from '@/types/corrida';
import { STATUS_LABELS, STATUS_COLORS, BUSCAR_LEVAR_LABELS } from '@/types/corrida';

interface CorridaCardRichProps {
  corrida: Corrida;
  showMotorista?: boolean;
  showSolicitante?: boolean;
  compact?: boolean;
}

const TIPO_ICONS: Record<string, React.ReactNode> = {
  '0': <CallReceived sx={{ fontSize: 14 }} />,
  '1': <LocalShipping sx={{ fontSize: 14 }} />,
  '3': <SwapHoriz sx={{ fontSize: 14 }} />,
};

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
        sx={{
          p: 1.5,
          cursor: 'pointer',
          transition: 'background-color 0.15s',
          '&:active': { bgcolor: 'action.selected' },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" noWrap fontWeight={600}>
              #{c.ID} - {parceiro}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
              {tempoStr && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {tempoStr}
                </Typography>
              )}
              {c.DT_FINISHED && (
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                  {format(new Date(c.DT_FINISHED), 'dd/MM HH:mm')}
                </Typography>
              )}
            </Stack>
          </Box>
          <Box
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: alpha(statusColor, 0.1),
            }}
          >
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: statusColor }}>
              {statusLabel}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      onClick={() => navigate(`/corrida/${c.ID}`)}
      elevation={0}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.15s',
        '&:active': { bgcolor: 'action.selected', transform: 'scale(0.99)' },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" fontWeight={700} color="text.secondary">
            #{c.ID}
          </Typography>
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 700,
              bgcolor: alpha(statusColor, 0.1),
              color: statusColor,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {TIPO_ICONS[c.BUSCARLEVAR]}
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {tipoLabel}
          </Typography>
        </Stack>
      </Stack>

      <Typography variant="body1" fontWeight={700} noWrap>
        {parceiro}
      </Typography>

      {(address || c.DESTINO) && (
        <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.25 }}>
          {address || c.DESTINO}
        </Typography>
      )}

      {phone && (
        <Typography
          component="a"
          href={`tel:${phone}`}
          variant="body2"
          color="primary"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          sx={{ textDecoration: 'none', display: 'block', mt: 0.25, fontSize: '0.8rem' }}
        >
          {phone}
        </Typography>
      )}

      {c.PASSAGEIROSMERCADORIA && (
        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }} noWrap>
          {c.PASSAGEIROSMERCADORIA}
        </Typography>
      )}

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}
      >
        <Stack direction="row" spacing={1.5}>
          {showSolicitante && (
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
              <FuncionarioAvatar codparc={c.CODPARC_SOL ?? null} nome={c.NOMESOLICITANTE} size="small" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" fontWeight={600} noWrap display="block" sx={{ fontSize: '0.7rem' }}>
                  {c.NOMESOLICITANTE}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: '0.65rem' }}>
                  {c.CARGO_SOL ?? c.SETOR ?? ''}
                </Typography>
              </Box>
            </Stack>
          )}
          {showMotorista && c.NOMEMOTORISTA && (
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
              <FuncionarioAvatar codparc={c.CODPARC_MOT ?? null} nome={c.NOMEMOTORISTA} size="small" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" fontWeight={600} noWrap display="block" sx={{ fontSize: '0.7rem' }}>
                  {c.NOMEMOTORISTA}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: '0.65rem' }}>
                  {c.CARGO_MOT ?? 'Motorista'}
                </Typography>
              </Box>
            </Stack>
          )}
        </Stack>

        {tempoStr && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
            <AccessTime sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
              {tempoStr}
            </Typography>
          </Stack>
        )}
      </Stack>
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
