import { Box, Typography, Button } from '@mui/material';
import { Visibility, ExitToApp } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';
import { useImpersonationNav } from '@/hooks/use-impersonation-sync';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

export function ImpersonationBanner() {
  const impersonating = useAuthStore((s) => s.impersonating);
  const { stopViewAs } = useImpersonationNav();

  if (!impersonating) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        px: 2,
        py: 0.5,
        bgcolor: '#F59E0B',
        color: '#1a1a1a',
        zIndex: 1300,
        flexShrink: 0,
      }}
    >
      <Visibility sx={{ fontSize: 16 }} />
      <FuncionarioAvatar
        codparc={impersonating.codparc}
        nome={impersonating.nome}
        size="small"
        sx={{ width: 24, height: 24, fontSize: 11 }}
      />
      <Typography
        sx={{ fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.2 }}
      >
        {impersonating.nome}
        <Box component="span" sx={{ fontWeight: 500, opacity: 0.7, ml: 0.5 }}>
          #{impersonating.codparc}
        </Box>
      </Typography>
      <Button
        size="small"
        variant="contained"
        startIcon={<ExitToApp sx={{ fontSize: 14 }} />}
        onClick={stopViewAs}
        sx={{
          ml: 'auto',
          bgcolor: 'rgba(0,0,0,0.2)',
          color: '#1a1a1a',
          fontWeight: 700,
          fontSize: '0.65rem',
          textTransform: 'none',
          minHeight: 26,
          px: 1,
          borderRadius: 2,
          boxShadow: 'none',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.35)', boxShadow: 'none' },
        }}
      >
        Voltar
      </Button>
    </Box>
  );
}
