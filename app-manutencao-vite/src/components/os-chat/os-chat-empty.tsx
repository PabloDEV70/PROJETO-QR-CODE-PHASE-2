import { Box, Typography } from '@mui/material';
import { EngineeringRounded, LockRounded } from '@mui/icons-material';
import { useChatColors } from './use-chat-colors';

export function OsChatEmpty() {
  const c = useChatColors();

  return (
    <Box sx={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 1.5, bgcolor: c.emptyBg,
    }}>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{
          position: 'absolute', width: 80, height: 80,
          borderRadius: '50%', bgcolor: c.sidebarHeaderBg,
        }} />
        <EngineeringRounded sx={{ fontSize: 64, color: c.accent, position: 'relative', zIndex: 1 }} />
      </Box>
      <Typography sx={{
        fontFamily: "'STOP', 'Arial Black', sans-serif",
        fontSize: 22, color: c.textPrimary, mt: 1,
        letterSpacing: '0.04em',
      }}>
        GIGANTAO
      </Typography>
      <Typography sx={{ fontSize: 14, color: c.emptyText, textAlign: 'center', maxWidth: 400 }}>
        Manutencao OS — selecione uma OS para ver os detalhes
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 4, color: c.textMuted }}>
        <LockRounded sx={{ fontSize: 12 }} />
        <Typography sx={{ fontSize: 12, color: c.textMuted }}>
          Dados internos e seguros
        </Typography>
      </Box>
    </Box>
  );
}
