import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { AppShell } from '@/components/layout/app-shell';
import { ProtectedRoute } from '@/components/layout/protected-route';

const LoginPage = lazy(() =>
  import('@/pages/login-page').then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/dashboard-page').then((m) => ({ default: m.DashboardPage })),
);
const OsPage = lazy(() =>
  import('@/pages/os-page').then((m) => ({ default: m.OsPage })),
);
const OsDetailPage = lazy(() =>
  import('@/pages/os-detail-page').then((m) => ({ default: m.OsDetailPage })),
);
const PlanosPage = lazy(() =>
  import('@/pages/planos-page').then((m) => ({ default: m.PlanosPage })),
);
const FrotaPage = lazy(() =>
  import('@/pages/frota-page').then((m) => ({ default: m.FrotaPage })),
);
const VeiculoDetailPage = lazy(() =>
  import('@/pages/veiculo-detail-page').then((m) => ({ default: m.VeiculoDetailPage })),
);
const RankingPage = lazy(() =>
  import('@/pages/ranking-page').then((m) => ({ default: m.RankingPage })),
);
const AlertasPage = lazy(() =>
  import('@/pages/alertas-page').then((m) => ({ default: m.AlertasPage })),
);
const AnalyticsPage = lazy(() =>
  import('@/pages/analytics-page').then((m) => ({ default: m.AnalyticsPage })),
);
const ApontamentosPage = lazy(() =>
  import('@/pages/apontamentos-page').then((m) => ({ default: m.ApontamentosPage })),
);
const TempoServicosPage = lazy(() =>
  import('@/pages/tempo-servicos-page').then((m) => ({ default: m.TempoServicosPage })),
);
const PerformanceServicoPage = lazy(() =>
  import('@/pages/performance-servico-page').then((m) => ({ default: m.PerformanceServicoPage })),
);

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
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
      { index: true, element: <Lazy><DashboardPage /></Lazy> },
      { path: 'ordens-de-servico', element: <Lazy><OsPage /></Lazy> },
      { path: 'ordens-de-servico/:nuos', element: <Lazy><OsDetailPage /></Lazy> },
      { path: 'os', element: <Navigate to="/ordens-de-servico" replace /> },
      { path: 'os/:nuos', element: <Navigate to="/ordens-de-servico" replace /> },
      { path: 'planos', element: <Lazy><PlanosPage /></Lazy> },
      { path: 'frota', element: <Lazy><FrotaPage /></Lazy> },
      { path: 'frota/:codveiculo', element: <Lazy><VeiculoDetailPage /></Lazy> },
      { path: 'ranking', element: <Lazy><RankingPage /></Lazy> },
      { path: 'alertas', element: <Lazy><AlertasPage /></Lazy> },
      { path: 'analytics', element: <Lazy><AnalyticsPage /></Lazy> },
      { path: 'apontamentos', element: <Lazy><ApontamentosPage /></Lazy> },
      { path: 'tempo-servicos', element: <Lazy><TempoServicosPage /></Lazy> },
      { path: 'performance-servico', element: <Lazy><PerformanceServicoPage /></Lazy> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
