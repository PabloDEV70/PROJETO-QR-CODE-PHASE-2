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
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppHeader />
      <Box
        component="main"
        sx={{
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 1.5, sm: 2 },
          pb: 4,
        }}
      >
        <Suspense fallback={<LoadingSkeleton message="Carregando..." />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
