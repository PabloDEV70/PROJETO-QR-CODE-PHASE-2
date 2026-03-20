import { Box, Typography, Button } from '@mui/material';
import { Visibility, ExitToApp } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

export function ImpersonationBanner() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const impersonating = useAuthStore((s) => s.impersonating);
  const stopImpersonating = useAuthStore((s) => s.stopImpersonating);

  const handleStop = () => {
    stopImpersonating();
    setSearchParams({});
  };

  if (!impersonating) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        px: 2,
        py: 0.75,
        bgcolor: '#F59E0B',
        color: '#1a1a1a',
        zIndex: 1300,
        flexShrink: 0,
      }}
    >
      <Visibility sx={{ fontSize: 18 }} />
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.2 }}
      >
        Visualizando como:{' '}
        <Box component="span" sx={{ fontWeight: 900 }}>
          {impersonating.codparc}
        </Box>
      </Typography>
      <Button
        size="small"
        variant="contained"
        startIcon={<ExitToApp sx={{ fontSize: 16 }} />}
        onClick={handleStop}
        sx={{
          ml: 1,
          bgcolor: 'rgba(0,0,0,0.2)',
          color: '#1a1a1a',
          fontWeight: 700,
          fontSize: '0.7rem',
          textTransform: 'none',
          minHeight: 28,
          px: 1.5,
          borderRadius: 2,
          boxShadow: 'none',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.35)',
            boxShadow: 'none',
          },
        }}
      >
        Voltar
      </Button>
    </Box>
  );
}
