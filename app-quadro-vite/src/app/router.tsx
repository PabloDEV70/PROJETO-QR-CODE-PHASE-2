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
const QuadroPage = lazy(() =>
  import('@/pages/quadro-page').then((m) => ({ default: m.QuadroPage })),
);
const VeiculosPage = lazy(() =>
  import('@/pages/veiculos-page').then((m) => ({ default: m.VeiculosPage })),
);
const NovaSituacaoPage = lazy(() =>
  import('@/pages/nova-situacao-page').then((m) => ({ default: m.NovaSituacaoPage })),
);
const SituacaoDetailPage = lazy(() =>
  import('@/pages/situacao-detail-page').then((m) => ({ default: m.SituacaoDetailPage })),
);
const RegistrosPage = lazy(() =>
  import('@/pages/registros-page').then((m) => ({ default: m.RegistrosPage })),
);
const OperadoresPage = lazy(() =>
  import('@/pages/operadores-page').then((m) => ({ default: m.OperadoresPage })),
);
const SituacoesConfigPage = lazy(() =>
  import('@/pages/situacoes-config-page').then((m) => ({ default: m.SituacoesConfigPage })),
);
const PrioridadesConfigPage = lazy(() =>
  import('@/pages/prioridades-config-page').then((m) => ({ default: m.PrioridadesConfigPage })),
);
const VeiculosStatusPage = lazy(() =>
  import('@/pages/veiculos-status-page').then((m) => ({ default: m.VeiculosStatusPage })),
);
const FluxoFrotaPage = lazy(() =>
  import('@/pages/fluxo-frota-page').then((m) => ({ default: m.FluxoFrotaPage })),
);
const PainelAeroportoPage = lazy(() =>
  import('@/pages/painel-aeroporto-page').then((m) => ({ default: m.PainelAeroportoPage })),
);
const EscalaServicosPage = lazy(() =>
  import('@/pages/escala-servicos-page').then((m) => ({ default: m.EscalaServicosPage })),
);
const EscalaGuindastesPage = lazy(() =>
  import('@/pages/escala-guindastes-page').then((m) => ({ default: m.EscalaGuindastesPage })),
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
    path: '/painel-aeroporto',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <PainelAeroportoPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/escala-servicos',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <EscalaServicosPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/escala-guindastes',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <EscalaGuindastesPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
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
        path: 'quadro',
        element: (
          <Suspense fallback={<Loading />}>
            <QuadroPage />
          </Suspense>
        ),
      },
      {
        path: 'veiculos',
        element: (
          <Suspense fallback={<Loading />}>
            <VeiculosPage />
          </Suspense>
        ),
      },
      {
        path: 'nova-situacao',
        element: (
          <Suspense fallback={<Loading />}>
            <NovaSituacaoPage />
          </Suspense>
        ),
      },
      {
        path: 'situacao/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <SituacaoDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'registros',
        element: (
          <Suspense fallback={<Loading />}>
            <RegistrosPage />
          </Suspense>
        ),
      },
      {
        path: 'operadores',
        element: (
          <Suspense fallback={<Loading />}>
            <OperadoresPage />
          </Suspense>
        ),
      },
      {
        path: 'config/situacoes',
        element: (
          <Suspense fallback={<Loading />}>
            <SituacoesConfigPage />
          </Suspense>
        ),
      },
      {
        path: 'config/prioridades',
        element: (
          <Suspense fallback={<Loading />}>
            <PrioridadesConfigPage />
          </Suspense>
        ),
      },
      {
        path: 'veiculos-status',
        element: (
          <Suspense fallback={<Loading />}>
            <VeiculosStatusPage />
          </Suspense>
        ),
      },
      {
        path: 'fluxo',
        element: (
          <Suspense fallback={<Loading />}>
            <FluxoFrotaPage />
          </Suspense>
        ),
      },
    ],
  },
]);
