import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';

export function RouteErrorBoundary() {
  const error = useRouteError();

  let title = 'Erro';
  let message = 'Ocorreu um erro inesperado.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Home />}
          component={Link}
          to="/"
        >
          Inicio
        </Button>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => window.history.back()}
        >
          Voltar
        </Button>
      </Box>
    </Box>
  );
}
