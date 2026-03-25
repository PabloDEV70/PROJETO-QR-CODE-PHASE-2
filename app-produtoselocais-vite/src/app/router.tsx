import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AppShell } from '@/components/layout/app-shell';

const LoginPage = lazy(() =>
  import('@/pages/login-page').then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/dashboard-page').then((m) => ({ default: m.DashboardPage })),
);
const LocaisPage = lazy(() =>
  import('@/pages/locais-page').then((m) => ({ default: m.LocaisPage })),
);
const ProdutosPage = lazy(() =>
  import('@/pages/produtos-page').then((m) => ({ default: m.ProdutosPage })),
);

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress />
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
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Suspense fallback={<Loading />}><DashboardPage /></Suspense>,
      },
      {
        path: 'locais',
        element: <Suspense fallback={<Loading />}><LocaisPage /></Suspense>,
      },
      {
        path: 'produtos',
        element: <Suspense fallback={<Loading />}><ProdutosPage /></Suspense>,
      },
    ],
  },
]);
