import { Button, Box } from '@mui/material';
import { Add, Analytics } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Button
        variant="contained"
        startIcon={<Add />}
        fullWidth
        size="large"
        onClick={() => navigate('/nova-situacao')}
        sx={{ py: 1.5, fontWeight: 600 }}
      >
        Nova Situacao
      </Button>
      <Button
        variant="contained"
        startIcon={<Analytics />}
        fullWidth
        size="large"
        onClick={() => navigate('/analise-frota')}
        sx={{ py: 1.5, fontWeight: 600, bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' } }}
      >
        Analise de Frota
      </Button>
    </Box>
  );
}
