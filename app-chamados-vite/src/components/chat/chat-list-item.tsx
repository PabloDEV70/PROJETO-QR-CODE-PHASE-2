import { Box, Typography } from '@mui/material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { PRIO_MAP } from '@/utils/chamados-constants';
import { elapsedShort } from '@/utils/date-helpers';
import { useChatColors } from './use-chat-colors';
import type { ChatListItem, ChamadoPrioridadeCode } from '@/types/chamados-types';

interface ChatListItemProps {
  item: ChatListItem;
  isSelected: boolean;
  isUnread: boolean;
  isOnline?: boolean;
  onClick: (nuchamado: number) => void;
}

export function ChatListItemRow({ item, isSelected, isUnread, isOnline, onClick }: ChatListItemProps) {
  const c = useChatColors();
  const prioDef = item.PRIORIDADE ? PRIO_MAP[item.PRIORIDADE as ChamadoPrioridadeCode] : null;
  const prioColor = prioDef?.color ?? c.textMuted;

  const preview = item.ULTIMA_TRATATIVA_TEXTO
    ? `${item.ULTIMA_TRATATIVA_AUTOR ?? ''}: ${item.ULTIMA_TRATATIVA_TEXTO}`
    : item.DESCRCHAMADO ?? '';

  return (
    <Box
      onClick={() => onClick(item.NUCHAMADO)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1.25,
        cursor: 'pointer',
        bgcolor: isSelected ? c.listItemSelected : 'transparent',
        '&:hover': {
          bgcolor: isSelected ? c.listItemSelected : c.listItemHover,
        },
        transition: 'background-color 0.15s',
      }}
    >
      {/* Avatar — 48px like WhatsApp */}
      <Box sx={{ flexShrink: 0, position: 'relative', display: 'inline-flex' }}>
        <FuncionarioAvatar
          codparc={item.CODPARCSOLICITANTE}
          nome={item.NOMESOLICITANTE ?? undefined}
          size="medium"
          sx={{ width: 48, height: 48, fontSize: 17 }}
        />
        {isOnline && (
          <Box sx={{
            position: 'absolute', bottom: 1, right: 1,
            width: 12, height: 12, borderRadius: '50%',
            bgcolor: '#22c55e',
            border: `2px solid ${isSelected ? c.listItemSelected : c.sidebarBg}`,
          }} />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0, borderBottom: `1px solid ${c.listDivider}`, pb: 1.25 }}>
        {/* Row 1: name + time */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 0.5 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: isUnread ? 500 : 400,
              color: c.textPrimary,
              overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', flex: 1, minWidth: 0,
            }}
          >
            {item.NOMESOLICITANTE ?? 'Sem solicitante'}
            {item.SETOR && (
              <Box component="span" sx={{ fontSize: 12, color: c.textMuted, fontWeight: 400, ml: 0.5 }}>
                - {item.SETOR}
              </Box>
            )}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: isUnread ? 600 : 400,
              color: isUnread ? c.unreadTime : c.textMuted,
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            {elapsedShort(item.ULTIMA_ATIVIDADE)}
          </Typography>
        </Box>

        {/* Row 2: preview + unread badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
          <Typography sx={{
            fontSize: 13.5,
            color: isUnread ? c.textPrimary : c.textSecondary,
            fontWeight: isUnread ? 500 : 400,
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', flex: 1, minWidth: 0,
            lineHeight: 1.4,
          }}>
            <Box component="span" sx={{ color: prioColor, fontWeight: 600, mr: 0.5 }}>
              #{item.NUCHAMADO}
            </Box>
            {preview || '\u00A0'}
          </Typography>

          {/* WhatsApp-style unread badge */}
          {isUnread && (
            <Box
              sx={{
                minWidth: 20, height: 20, px: 0.5,
                borderRadius: 10,
                bgcolor: c.unreadDot, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                {item.TOTAL_OCORRENCIAS || ''}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
