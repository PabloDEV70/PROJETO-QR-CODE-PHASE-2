import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AppShellMotorista } from '@/components/layout/app-shell-motorista';
import { AppShellSolicitante } from '@/components/layout/app-shell-solicitante';

const LoginPage = lazy(() =>
  import('@/pages/login-page').then((m) => ({ default: m.LoginPage })),
);

const RoleRedirectPage = lazy(() =>
  import('@/pages/role-redirect-page').then((m) => ({ default: m.RoleRedirectPage })),
);

const MotoristaPage = lazy(() =>
  import('@/pages/motorista-page').then((m) => ({ default: m.MotoristaPage })),
);

const CorridaAtivaPage = lazy(() =>
  import('@/pages/corrida-ativa-page').then((m) => ({ default: m.CorridaAtivaPage })),
);

const SolicitarPage = lazy(() =>
  import('@/pages/solicitar-page').then((m) => ({ default: m.SolicitarPage })),
);

const MinhasCorridasPage = lazy(() =>
  import('@/pages/minhas-corridas-page').then((m) => ({ default: m.MinhasCorridasPage })),
);

const CorridaDetalhePage = lazy(() =>
  import('@/pages/corrida-detalhe-page').then((m) => ({ default: m.CorridaDetalhePage })),
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
    path: '/',
    element: (
      <ProtectedRoute>
        <Lazy><RoleRedirectPage /></Lazy>
      </ProtectedRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <AppShellMotorista />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'motorista',
        element: <Lazy><MotoristaPage /></Lazy>,
      },
      {
        path: 'motorista/corrida/:id',
        element: <Lazy><CorridaAtivaPage /></Lazy>,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppShellSolicitante />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'solicitar',
        element: <Lazy><SolicitarPage /></Lazy>,
      },
      {
        path: 'minhas',
        element: <Lazy><MinhasCorridasPage /></Lazy>,
      },
      {
        path: 'corrida/:id',
        element: <Lazy><CorridaDetalhePage /></Lazy>,
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
