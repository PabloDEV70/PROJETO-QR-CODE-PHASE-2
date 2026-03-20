import { Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuthStore } from '@/stores/auth-store';
import { AppHeader } from '@/components/layout/app-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { OfflineBanner } from '@/components/shared/offline-banner';
import { ImpersonationBanner } from '@/components/shared/impersonation-banner';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { SwUpdatePrompt } from '@/components/shared/sw-update-prompt';
import { PwaInstallPrompt } from '@/components/shared/pwa-install-prompt';
import { useImpersonationSync } from '@/hooks/use-impersonation-sync';

export function AppShell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useImpersonationSync();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <AppHeader />
      <ImpersonationBanner />
      <OfflineBanner />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', overflowX: 'hidden', px: { xs: 1, sm: 2 }, pt: { xs: 1, sm: 2 }, pb: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>
        <Suspense fallback={<LoadingSkeleton message="Carregando..." />}>
          <Outlet />
        </Suspense>
      </Box>
      <BottomNav />
      <SwUpdatePrompt />
      <PwaInstallPrompt />
    </Box>
  );
}
