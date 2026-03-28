import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useMyRole } from '@/hooks/use-my-role';

export function RoleRedirectPage() {
  const navigate = useNavigate();
  const { data: role, isLoading, isError } = useMyRole();

  useEffect(() => {
    if (isLoading) return;
    if (isError || !role) {
      navigate('/solicitar', { replace: true });
      return;
    }
    if (role.isMotorista) {
      navigate('/motorista', { replace: true });
    } else {
      navigate('/solicitar', { replace: true });
    }
  }, [role, isLoading, isError, navigate]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
      <CircularProgress size={32} />
    </Box>
  );
}
