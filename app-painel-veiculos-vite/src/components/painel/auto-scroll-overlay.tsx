import { IconButton, Box, Typography } from '@mui/material';
import { PlayArrow, Pause, Add, Remove } from '@mui/icons-material';
import { usePainelStore } from '@/stores/painel-store';

export function AutoScrollOverlay() {
  const isPaused = usePainelStore((s) => s.isPaused);
  const speed = usePainelStore((s) => s.scrollSpeed);
  const setIsPaused = usePainelStore((s) => s.setIsPaused);
  const setSpeed = usePainelStore((s) => s.setScrollSpeed);

  return (
    <Box sx={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 10,
      display: 'flex', alignItems: 'center', gap: 0.5,
      bgcolor: 'background.paper', borderRadius: 2, px: 1, py: 0.5,
    }}>
      <IconButton size="small" onClick={() => setIsPaused(!isPaused)}>
        {isPaused ? <PlayArrow sx={{ fontSize: 18 }} /> : <Pause sx={{ fontSize: 18 }} />}
      </IconButton>
      <IconButton size="small" onClick={() => setSpeed(Math.max(0.5, speed - 0.5))}>
        <Remove sx={{ fontSize: 16 }} />
      </IconButton>
      <Typography sx={{ fontSize: '0.7rem', minWidth: 20, textAlign: 'center' }}>
        {speed}x
      </Typography>
      <IconButton size="small" onClick={() => setSpeed(Math.min(5, speed + 0.5))}>
        <Add sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
}
