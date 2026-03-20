import { Box, Typography, Stack } from '@mui/material';
import {
  ConfirmationNumberRounded, PersonOutline,
  SupportAgent, CheckCircle, Business,
} from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { PrioBadge, StatusBadge } from '@/components/chamados/chamado-badges';
import { TIPO_MAP } from '@/utils/chamados-constants';
import { formatDate } from '@/utils/date-helpers';
import { useChatColors } from './use-chat-colors';
import type { Chamado } from '@/types/chamados-types';

interface ChatTicketBubbleProps {
  chamado: Chamado;
}

function PersonRow({
  icon,
  label,
  nome,
  codparc,
  textMuted,
  textPrimary,
  textSecondary,
}: {
  icon: React.ReactNode;
  label: string;
  nome: string | null;
  codparc: number | null;
  textMuted: string;
  textPrimary: string;
  textSecondary: string;
}) {
  if (!nome) return null;
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minHeight: 28 }}>
      <FuncionarioAvatar codparc={codparc} nome={nome} size="small"
        sx={{ width: 22, height: 22, fontSize: 10 }} />
      <Box sx={{ color: textMuted, display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Typography sx={{ fontSize: 11, color: textSecondary }}>
        <Box component="span" sx={{ fontWeight: 600, color: textPrimary }}>{nome}</Box>
        {' '}&middot; {label}
      </Typography>
    </Stack>
  );
}

const VIA_SUFFIX = '— via chamados.gigantao.net';

export function ChatTicketBubble({ chamado }: ChatTicketBubbleProps) {
  const c = useChatColors();

  const tipoLabel = chamado.TIPOCHAMADO
    ? TIPO_MAP[chamado.TIPOCHAMADO] ?? chamado.TIPOCHAMADO
    : null;

  const rawDescr = chamado.DESCRCHAMADO ?? '';
  const viaIdx = rawDescr.lastIndexOf(VIA_SUFFIX);
  const descrBody = viaIdx > -1 ? rawDescr.slice(0, viaIdx).trimEnd() : rawDescr;
  const hasSignature = viaIdx > -1;

  return (
    <Box
      sx={{
        maxWidth: '85%',
        mx: 'auto',
        mb: 2,
        bgcolor: c.ticketBg,
        border: `1px solid ${c.ticketBorder}`,
        borderRadius: '12px',
        px: 2,
        py: 1.5,
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
        <ConfirmationNumberRounded sx={{ fontSize: 16, color: c.accent }} />
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: c.textPrimary, flex: 1 }}>
          Chamado #{chamado.NUCHAMADO}
        </Typography>
        <StatusBadge status={chamado.STATUS} size="sm" />
      </Stack>

      {/* Description */}
      <Typography
        sx={{
          fontSize: 13,
          color: c.textPrimary,
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          mb: 1,
        }}
      >
        {descrBody}
      </Typography>
      {hasSignature && (
        <Typography sx={{
          fontSize: 9, color: c.textMuted, fontStyle: 'italic',
          mb: 0.75, opacity: 0.7,
        }}>
          via chamados.gigantao.net
        </Typography>
      )}

      {/* People */}
      <Box sx={{
        pt: 1, borderTop: `1px solid ${c.listDivider}`,
        display: 'flex', flexDirection: 'column', gap: 0.25,
      }}>
        <PersonRow
          icon={<PersonOutline sx={{ fontSize: 14 }} />}
          label="Solicitante"
          nome={chamado.NOMESOLICITANTE}
          codparc={chamado.CODPARCSOLICITANTE}
          textMuted={c.textMuted}
          textPrimary={c.textPrimary}
          textSecondary={c.textSecondary}
        />
        <PersonRow
          icon={<SupportAgent sx={{ fontSize: 14 }} />}
          label="Atribuido"
          nome={chamado.NOMEATRIBUIDO}
          codparc={chamado.CODPARCATRIBUIDO}
          textMuted={c.textMuted}
          textPrimary={c.textPrimary}
          textSecondary={c.textSecondary}
        />
        <PersonRow
          icon={<CheckCircle sx={{ fontSize: 14 }} />}
          label="Finalizado por"
          nome={chamado.NOMEFINALIZADOR}
          codparc={chamado.CODPARCFINALIZADOR}
          textMuted={c.textMuted}
          textPrimary={c.textPrimary}
          textSecondary={c.textSecondary}
        />
        {chamado.NOMEPARC && (
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minHeight: 28 }}>
            <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: c.searchInputBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Business sx={{ fontSize: 12, color: c.textMuted }} />
            </Box>
            <Box sx={{ color: c.textMuted, display: 'flex', alignItems: 'center' }}>
              <Business sx={{ fontSize: 14 }} />
            </Box>
            <Typography sx={{ fontSize: 11, color: c.textSecondary }}>
              <Box component="span" sx={{ fontWeight: 600, color: c.textPrimary }}>{chamado.NOMEPARC}</Box>
              {' '}&middot; Parceiro
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Footer */}
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}
        sx={{ pt: 0.75, mt: 0.5, borderTop: `1px solid ${c.listDivider}` }}>
        <Typography sx={{ fontSize: 10, color: c.textMuted }}>
          {formatDate(chamado.DHCHAMADO)}
        </Typography>
        <PrioBadge prioridade={chamado.PRIORIDADE} size="sm" />
        {tipoLabel && (
          <Typography sx={{
            fontSize: 10, color: c.textSecondary, bgcolor: c.searchInputBg,
            px: 0.75, py: 0.15, borderRadius: '4px',
          }}>
            {tipoLabel}
          </Typography>
        )}
        {chamado.SETOR && (
          <Typography sx={{
            fontSize: 10, color: c.textSecondary, bgcolor: c.searchInputBg,
            px: 0.75, py: 0.15, borderRadius: '4px',
          }}>
            {chamado.SETOR}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
