import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { AppShell } from '@/components/layout/app-shell';
import { ProtectedRoute } from '@/components/layout/protected-route';

const LoginPage = lazy(() =>
  import('@/pages/login-page').then((m) => ({ default: m.LoginPage })),
);
const AcompanhamentoComprasPage = lazy(() =>
  import('@/pages/acompanhamento-compras-page').then((m) => ({ default: m.AcompanhamentoComprasPage })),
);
const RequisicoesPage = lazy(() =>
  import('@/pages/requisicoes-page').then((m) => ({ default: m.RequisicoesPage })),
);
const CotacoesPage = lazy(() =>
  import('@/pages/cotacoes-page').then((m) => ({ default: m.CotacoesPage })),
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
      { index: true, element: <Navigate to="/acompanhamento-compras" replace /> },
      { path: 'acompanhamento-compras', element: <Lazy><AcompanhamentoComprasPage /></Lazy> },
      { path: 'requisicoes-compras', element: <Lazy><RequisicoesPage /></Lazy> },
      { path: 'requisicoes-manutencao', element: <Lazy><RequisicoesPage /></Lazy> },
      { path: 'cotacoes', element: <Lazy><CotacoesPage /></Lazy> },
      { path: '*', element: <Navigate to="/acompanhamento-compras" replace /> },
    ],
  },
]);
