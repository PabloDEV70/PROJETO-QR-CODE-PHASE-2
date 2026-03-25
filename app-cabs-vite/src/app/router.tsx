import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AppShell } from '@/components/layout/app-shell';

const LoginPage = lazy(() =>
  import('@/pages/login-page').then((m) => ({ default: m.LoginPage })),
);
const EmTempoRealPage = lazy(() =>
  import('@/pages/em-tempo-real-page').then((m) => ({ default: m.EmTempoRealPage })),
);
const CabDetalhamentoPage = lazy(() =>
  import('@/pages/cab-detalhamento-page'),
);
const CabsPorTopPage = lazy(() =>
  import('@/pages/cabs-por-top-page').then((m) => ({ default: m.CabsPorTopPage })),
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
    element: <Suspense fallback={<Loading />}><LoginPage /></Suspense>,
  },
  {
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Navigate to="/em-tempo-real" replace />,
      },
      {
        path: 'em-tempo-real',
        element: <Suspense fallback={<Loading />}><EmTempoRealPage /></Suspense>,
      },
      {
        path: 'cab/:nunota',
        element: <Suspense fallback={<Loading />}><CabDetalhamentoPage /></Suspense>,
      },
      {
        path: 'cab',
        element: <Suspense fallback={<Loading />}><CabDetalhamentoPage /></Suspense>,
      },
      {
        path: 'por-top',
        element: <Suspense fallback={<Loading />}><CabsPorTopPage /></Suspense>,
      },
    ],
  },
]);
