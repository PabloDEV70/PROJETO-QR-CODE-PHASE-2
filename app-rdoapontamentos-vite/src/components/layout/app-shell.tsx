import { Suspense, useEffect } from 'react';
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuthStore } from '@/stores/auth-store';
import { AppHeader } from '@/components/layout/app-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { OfflineBanner } from '@/components/shared/offline-banner';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { SwUpdatePrompt } from '@/components/shared/sw-update-prompt';
import { PwaInstallPrompt } from '@/components/shared/pwa-install-prompt';
import { ImpersonationBanner } from '@/components/shared/impersonation-banner';

function UrlImpersonationSync() {
  const [searchParams] = useSearchParams();
  const impersonating = useAuthStore((s) => s.impersonating);
  const startImpersonating = useAuthStore((s) => s.startImpersonating);
  const stopImpersonating = useAuthStore((s) => s.stopImpersonating);

  const asParc = searchParams.get('asParc');

  useEffect(() => {
    if (asParc && !impersonating) {
      startImpersonating(parseInt(asParc, 10), `Parc ${asParc}`);
    }
  }, [asParc, impersonating, startImpersonating]);

  useEffect(() => {
    if (!asParc && impersonating) {
      stopImpersonating();
    }
  }, [asParc, impersonating, stopImpersonating]);

  return null;
}

export function AppShell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <UrlImpersonationSync />
      <ImpersonationBanner />
      <AppHeader />
      <OfflineBanner />
      <Box sx={{
        flex: 1, minHeight: 0, overflow: 'auto', overflowX: 'hidden',
        px: { xs: 1, sm: 2 },
        pt: { xs: 1, sm: 2 },
        pb: isAdminRoute ? 2 : 'calc(72px + env(safe-area-inset-bottom, 0px))',
      }}>
        <Suspense fallback={<LoadingSkeleton message="Carregando..." />}>
          <Outlet />
        </Suspense>
      </Box>
      {isAdminRoute ? null : <BottomNav />}
      <SwUpdatePrompt />
      <PwaInstallPrompt />
    </Box>
  );
}
