import { Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuthStore } from '@/stores/auth-store';
import { AppHeader } from '@/components/layout/app-header';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

export function AppShell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      <AppHeader />
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          overflowX: 'hidden',
          px: { xs: 1, sm: 2 },
          pt: { xs: 1, sm: 2 },
          pb: 2,
        }}
      >
        <Suspense fallback={<LoadingSkeleton message="Carregando..." />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
