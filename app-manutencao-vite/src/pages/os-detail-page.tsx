import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useOsById } from '@/hooks/use-ordens-servico';
import { OsDetailRedesign } from '@/components/os/redesign/os-detail-redesign';

export function OsDetailPage() {
  const { nuos } = useParams<{ nuos: string }>();
  const navigate = useNavigate();
  const nuosNum = nuos ? Number(nuos) : null;
  const { data: os, isLoading } = useOsById(nuosNum);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (!os) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <IconButton onClick={() => navigate('/ordens-de-servico')} sx={{ mb: 2 }}><ArrowBack /></IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>OS não encontrada</Typography>
        <Typography color="text.secondary">A ordem de serviço solicitada não existe ou foi removida.</Typography>
      </Box>
    );
  }

  return <OsDetailRedesign os={os} />;
}
