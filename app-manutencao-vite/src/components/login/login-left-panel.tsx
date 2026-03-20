import { Box, Typography } from '@mui/material';
import { useThemeStore } from '@/stores/theme-store';

export function LoginLeftPanel() {
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === 'dark';

  const gradient = isDark
    ? 'linear-gradient(135deg, #0d2b0d 0%, #1b5e20 50%, #2e7d32 100%)'
    : 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #43a047 100%)';

  return (
    <Box
      sx={{
        position: 'relative',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '55%',
        background: gradient,
        overflow: 'hidden',
        p: 6,
      }}
    >
      <Box sx={{
        position: 'absolute', top: -80, left: -80,
        width: 300, height: 300, borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.05)',
      }} />
      <Box sx={{
        position: 'absolute', bottom: -120, right: -60,
        width: 400, height: 400, borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.04)',
      }} />
      <Typography
        sx={{
          fontFamily: "'STOP', 'Arial Black', sans-serif",
          fontSize: '3.5rem',
          fontWeight: 400,
          color: '#ffffff',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          zIndex: 1,
          mb: 1,
        }}
      >
        GIGANTAO
      </Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 500, zIndex: 1 }}>
        Manutencao OS
      </Typography>
      <Box
        sx={{
          width: 60, height: 3,
          bgcolor: 'rgba(255,255,255,0.3)',
          borderRadius: 2, mt: 2, zIndex: 1,
        }}
      />
    </Box>
  );
}
