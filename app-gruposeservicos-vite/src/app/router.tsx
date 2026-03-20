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
const ArvorePage = lazy(() =>
  import('@/pages/arvore-page').then((m) => ({ default: m.ArvorePage })),
);
const ServicosPage = lazy(() =>
  import('@/pages/servicos-page').then((m) => ({ default: m.ServicosPage })),
);
const GrupoDetalhePage = lazy(() =>
  import('@/pages/grupo-detalhe-page').then((m) => ({ default: m.GrupoDetalhePage })),
);
const NaoUtilizadosPage = lazy(() =>
  import('@/pages/nao-utilizados-page').then((m) => ({ default: m.NaoUtilizadosPage })),
);
const EstudoPage = lazy(() =>
  import('@/pages/estudo-page').then((m) => ({ default: m.EstudoPage })),
);
const GerenciarPage = lazy(() =>
  import('@/pages/gerenciar-page').then((m) => ({ default: m.GerenciarPage })),
);
const EficienciaPage = lazy(() =>
  import('@/pages/eficiencia-page').then((m) => ({ default: m.EficienciaPage })),
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
        element: (
          <Suspense fallback={<Loading />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'arvore',
        element: (
          <Suspense fallback={<Loading />}>
            <ArvorePage />
          </Suspense>
        ),
      },
      {
        path: 'servicos',
        element: (
          <Suspense fallback={<Loading />}>
            <ServicosPage />
          </Suspense>
        ),
      },
      {
        path: 'nao-utilizados',
        element: (
          <Suspense fallback={<Loading />}>
            <NaoUtilizadosPage />
          </Suspense>
        ),
      },
      {
        path: 'estudo',
        element: (
          <Suspense fallback={<Loading />}>
            <EstudoPage />
          </Suspense>
        ),
      },
      {
        path: 'eficiencia',
        element: (
          <Suspense fallback={<Loading />}>
            <EficienciaPage />
          </Suspense>
        ),
      },
      {
        path: 'gerenciar',
        element: (
          <Suspense fallback={<Loading />}>
            <GerenciarPage />
          </Suspense>
        ),
      },
      {
        path: 'grupo/:codGrupo',
        element: (
          <Suspense fallback={<Loading />}>
            <GrupoDetalhePage />
          </Suspense>
        ),
      },
    ],
  },
]);
