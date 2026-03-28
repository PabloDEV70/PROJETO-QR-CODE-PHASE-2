import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { AppShellWithNav } from '@/components/layout/app-shell-with-nav';
import { ProtectedRoute } from '@/components/layout/protected-route';

const LoginPage = lazy(() =>
  import('@/pages/login-page').then((m) => ({ default: m.LoginPage })),
);

const DashboardPage = lazy(() =>
  import('@/pages/dashboard-page').then((m) => ({ default: m.DashboardPage })),
);

const CorridasListPage = lazy(() =>
  import('@/pages/corridas-list-page').then((m) => ({ default: m.CorridasListPage })),
);

const CorridaDetailPage = lazy(() =>
  import('@/pages/corrida-detail-page').then((m) => ({ default: m.CorridaDetailPage })),
);

const NovaCorridaPage = lazy(() =>
  import('@/pages/nova-corrida-page').then((m) => ({ default: m.NovaCorridaPage })),
);

const EstatisticasPage = lazy(() =>
  import('@/pages/estatisticas-page').then((m) => ({ default: m.EstatisticasPage })),
);

const MotoristaPage = lazy(() =>
  import('@/pages/motorista-page').then((m) => ({ default: m.MotoristaPage })),
);

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress size={32} />
    </Box>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<Loading />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <AppShellWithNav />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'corridas',
        element: (
          <Suspense fallback={<Loading />}>
            <CorridasListPage />
          </Suspense>
        ),
      },
      {
        path: 'corridas/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <CorridaDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'nova-corrida',
        element: (
          <Suspense fallback={<Loading />}>
            <NovaCorridaPage />
          </Suspense>
        ),
      },
      {
        path: 'estatisticas',
        element: (
          <Suspense fallback={<Loading />}>
            <EstatisticasPage />
          </Suspense>
        ),
      },
      {
        path: 'motorista',
        element: (
          <Suspense fallback={<Loading />}>
            <MotoristaPage />
          </Suspense>
        ),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
