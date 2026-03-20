import { useState } from 'react';
import {
  Box, Typography, IconButton, Menu, MenuItem, ListItemIcon,
  useMediaQuery, useTheme,
} from '@mui/material';
import { ExpandMore, DeleteOutline } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { fmtBubbleTime } from '@/utils/date-helpers';
import { useChatColors } from './use-chat-colors';
import type { ChamadoOcorrencia } from '@/types/chamados-types';

interface ChatMessageBubbleProps {
  ocorrencia: ChamadoOcorrencia;
  isOwn: boolean;
  showTail?: boolean;
  isTI?: boolean;
  onDelete?: (nuchamado: number, sequencia: number) => void;
}

const VIA_SUFFIX = '— via chamados.gigantao.net';

function splitSignature(text: string | null): { body: string; hasSignature: boolean } {
  if (!text) return { body: '', hasSignature: false };
  const idx = text.lastIndexOf(VIA_SUFFIX);
  if (idx === -1) return { body: text, hasSignature: false };
  return { body: text.slice(0, idx).trimEnd(), hasSignature: true };
}

export function ChatMessageBubble({
  ocorrencia, isOwn, showTail = true, isTI, onDelete,
}: ChatMessageBubbleProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const c = useChatColors();
  const maxW = isMobile ? '85%' : '65%';
  const bubbleColor = isOwn ? c.bubbleOwn : c.bubbleOther;
  const { body, hasSignature } = splitSignature(ocorrencia.DESCROCORRENCIA);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuAnchor(null); }}
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        alignItems: 'flex-end',
        gap: 0.5,
        mb: 0.25,
        px: { xs: 1, sm: 4 },
      }}
    >
      {!isOwn && showTail && (
        <FuncionarioAvatar
          codparc={ocorrencia.CODPARCATENDENTE}
          nome={ocorrencia.NOMEATENDENTE ?? undefined}
          size="small"
          sx={{ width: 24, height: 24, fontSize: 10, mb: 0.5 }}
        />
      )}
      {!isOwn && !showTail && <Box sx={{ width: 24, flexShrink: 0 }} />}

      <Box sx={{ position: 'relative', maxWidth: maxW }}>
        <Box
          sx={{
            bgcolor: bubbleColor,
            borderRadius: isOwn
              ? showTail ? '8px 8px 0px 8px' : '8px'
              : showTail ? '8px 8px 8px 0px' : '8px',
            px: 1.25,
            py: 0.5,
            boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
            ...(showTail && isOwn && {
              '&::after': {
                content: '""', position: 'absolute', bottom: 0, right: -8,
                borderStyle: 'solid', borderWidth: '0 0 8px 8px',
                borderColor: `transparent transparent transparent ${bubbleColor}`,
              },
            }),
            ...(showTail && !isOwn && {
              '&::after': {
                content: '""', position: 'absolute', bottom: 0, left: -8,
                borderStyle: 'solid', borderWidth: '0 8px 8px 0',
                borderColor: `transparent ${bubbleColor} transparent transparent`,
              },
            }),
          }}
        >
          {/* Author name */}
          <Typography sx={{
            fontSize: 12.5, fontWeight: 600,
            color: isOwn ? c.bubbleOwnName : c.bubbleOtherName,
            mb: 0.15, lineHeight: 1.35,
          }}>
            {ocorrencia.NOMEATENDENTE || 'Desconhecido'}
          </Typography>

          {/* Message text */}
          <Box>
            <Typography component="span" sx={{
              fontSize: 14, color: isOwn ? c.bubbleOwnText : c.bubbleOtherText,
              lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap',
            }}>
              {body}
            </Typography>
            <Box component="span" sx={{
              float: 'right', mt: 0.75, ml: 1,
              display: 'flex', alignItems: 'center', gap: 0.5,
            }}>
              {hasSignature && (
                <Typography component="span" sx={{
                  fontSize: 9, color: c.bubbleMeta, fontStyle: 'italic', opacity: 0.7,
                }}>
                  via plataforma
                </Typography>
              )}
              <Typography component="span" sx={{
                fontSize: 11, color: c.bubbleMeta, whiteSpace: 'nowrap',
              }}>
                {fmtBubbleTime(ocorrencia.DHOCORRENCIA)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* TI context menu trigger */}
        {isTI && hovered && (
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{
              position: 'absolute',
              top: 2,
              ...(isOwn ? { left: -28 } : { right: -28 }),
              width: 22, height: 22,
              bgcolor: c.searchInputBg,
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
              '&:hover': { bgcolor: c.listDivider },
            }}
          >
            <ExpandMore sx={{ fontSize: 14, color: c.textMuted }} />
          </IconButton>
        )}

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          slotProps={{ paper: { sx: { minWidth: 140 } } }}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              onDelete?.(ocorrencia.NUCHAMADO, ocorrencia.SEQUENCIA);
            }}
            sx={{ fontSize: 13, color: '#ef4444', gap: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 'auto !important' }}>
              <DeleteOutline sx={{ fontSize: 18, color: '#ef4444' }} />
            </ListItemIcon>
            Remover tratativa
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
