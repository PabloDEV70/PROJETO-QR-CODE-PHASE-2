import { Navigate, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuthStore } from '@/stores/auth-store';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import { ModeNav } from '@/components/layout/mode-nav';
import { useRodizio } from '@/hooks/use-rodizio';

export function PainelShell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: painel } = useHstVeiPainel();
  const rodizio = useRodizio();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <ModeNav
        rodizio={rodizio}
        totalVeiculos={painel?.totalVeiculos}
        totalSituacoes={painel?.totalSituacoesAtivas}
      />
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
