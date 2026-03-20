import { Box, Typography } from '@mui/material';
import { SentimentDissatisfied } from '@mui/icons-material';

export function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <SentimentDissatisfied sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Pagina nao encontrada
      </Typography>
      <Typography color="text.secondary">
        O recurso que voce procura nao existe ou foi removido.
      </Typography>
    </Box>
  );
}
