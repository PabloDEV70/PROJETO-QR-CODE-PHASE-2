import { useRouteError, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export function RouteErrorBoundary() {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
        p: 3,
      }}
    >
      <Typography variant="h5" fontWeight={700}>
        Algo deu errado
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {error?.message || 'Erro inesperado na aplicacao'}
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Voltar ao inicio
      </Button>
    </Box>
  );
}
