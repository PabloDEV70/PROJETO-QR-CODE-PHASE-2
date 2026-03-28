import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AppShell } from '@/components/layout/app-shell';

const LoginPage = lazy(() =>
  import('@/pages/login-page').then((m) => ({ default: m.LoginPage })),
);

const HomePage = lazy(() =>
  import('@/pages/home-page').then((m) => ({ default: m.HomePage })),
);

const CorridasPage = lazy(() =>
  import('@/pages/corridas-page').then((m) => ({ default: m.CorridasPage })),
);

const CorridaDetailPage = lazy(() =>
  import('@/pages/corrida-detail-page').then((m) => ({ default: m.CorridaDetailPage })),
);

const MapaLivePage = lazy(() =>
  import('@/pages/mapa-live-page').then((m) => ({ default: m.MapaLivePage })),
);

const NovaCorridaPage = lazy(() =>
  import('@/pages/nova-corrida-page').then((m) => ({ default: m.NovaCorridaPage })),
);

const PerfilPage = lazy(() =>
  import('@/pages/perfil-page').then((m) => ({ default: m.PerfilPage })),
);

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, minHeight: '40vh' }}>
      <CircularProgress size={32} />
    </Box>
  );
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Lazy><LoginPage /></Lazy>,
  },
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Lazy><HomePage /></Lazy>,
      },
      {
        path: 'corridas',
        element: <Lazy><CorridasPage /></Lazy>,
      },
      {
        path: 'corrida/:id',
        element: <Lazy><CorridaDetailPage /></Lazy>,
      },
      {
        path: 'mapa',
        element: <Lazy><MapaLivePage /></Lazy>,
      },
      {
        path: 'nova',
        element: <Lazy><NovaCorridaPage /></Lazy>,
      },
      {
        path: 'perfil',
        element: <Lazy><PerfilPage /></Lazy>,
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
