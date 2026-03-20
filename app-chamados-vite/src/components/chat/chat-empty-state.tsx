import { Box, Typography } from '@mui/material';
import { SupportAgentRounded, LockRounded } from '@mui/icons-material';
import { useChatColors } from './use-chat-colors';

export function ChatEmptyState() {
  const c = useChatColors();

  return (
    <Box
      sx={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 1.5, bgcolor: c.emptyBg,
      }}
    >
      {/* Accent circle behind icon */}
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{
          position: 'absolute', width: 80, height: 80,
          borderRadius: '50%', bgcolor: c.sidebarHeaderBg,
        }} />
        <SupportAgentRounded
          sx={{ fontSize: 64, color: c.accent, position: 'relative', zIndex: 1 }}
        />
      </Box>

      <Typography sx={{
        fontFamily: "'STOP', 'Arial Black', sans-serif",
        fontSize: 22, color: c.textPrimary, mt: 1,
        letterSpacing: '0.04em',
      }}>
        GIGANTAO
      </Typography>
      <Typography sx={{ fontSize: 14, color: c.emptyText, textAlign: 'center', maxWidth: 400 }}>
        Chamados de TI — selecione um chamado para ver a conversa
      </Typography>

      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.5,
        mt: 4, color: c.textMuted, fontSize: 12,
      }}>
        <LockRounded sx={{ fontSize: 12 }} />
        <Typography sx={{ fontSize: 12, color: c.textMuted }}>
          Suas tratativas sao internas e seguras
        </Typography>
      </Box>
    </Box>
  );
}
