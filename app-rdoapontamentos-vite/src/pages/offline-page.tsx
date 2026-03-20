import { Box, Typography, Button } from '@mui/material';
import { WifiOff, Refresh } from '@mui/icons-material';

export function OfflinePage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
        textAlign: 'center',
        px: 3,
      }}
    >
      <WifiOff sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Typography variant="h6" fontWeight={700}>
        Sem conexao
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
        Voce esta offline e esta pagina nao esta disponivel no cache. Verifique sua conexao e tente novamente.
      </Typography>
      <Button
        variant="contained"
        startIcon={<Refresh />}
        onClick={() => window.location.reload()}
        sx={{ mt: 1 }}
      >
        Tentar novamente
      </Button>
    </Box>
  );
}

export default OfflinePage;
