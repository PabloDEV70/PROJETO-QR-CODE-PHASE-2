import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

export function RouteErrorBoundary() {
  const error = useRouteError();

  let message = 'Erro inesperado na aplicacao';
  if (isRouteErrorResponse(error)) {
    message = error.status === 404
      ? 'Pagina nao encontrada'
      : `Erro ${error.status}: ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <Box sx={{
      display: 'flex', justifyContent: 'center',
      alignItems: 'center', minHeight: '60vh',
    }}>
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
        <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Algo deu errado
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Recarregar pagina
        </Button>
      </Paper>
    </Box>
  );
}
