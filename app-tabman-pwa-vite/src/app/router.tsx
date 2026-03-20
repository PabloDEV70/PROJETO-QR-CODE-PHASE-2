import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

const SetupPage = lazy(() =>
  import('@/pages/setup-page').then((m) => ({ default: m.SetupPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/dashboard-page').then((m) => ({ default: m.DashboardPage })),
);
const SelectorPage = lazy(() =>
  import('@/pages/selector-page').then((m) => ({ default: m.SelectorPage })),
);
const ApontamentoPage = lazy(() =>
  import('@/pages/apontamento-page').then((m) => ({
    default: m.ApontamentoPage,
  })),
);
const ConfiguracoesPage = lazy(() =>
  import('@/pages/configuracoes-page').then((m) => ({ default: m.ConfiguracoesPage })),
);
const TabletShell = lazy(() =>
  import('@/pages/tablet-shell').then((m) => ({ default: m.TabletShell })),
);
const VeiculosPlacasPage = lazy(() =>
  import('@/pages/veiculos-placas-page').then((m) => ({ default: m.VeiculosPlacasPage })),
);
const GuindautosPage = lazy(() =>
  import('@/pages/guindautos-page').then((m) => ({ default: m.GuindautosPage })),
);
const VeiculosTabelaPage = lazy(() =>
  import('@/pages/veiculos-tabela-page').then((m) => ({ default: m.default })),
);
const ParceirosPage = lazy(() =>
  import('@/pages/parceiros-page').then((m) => ({ default: m.default })),
);
const NovoRdoPage = lazy(() =>
  import('@/pages/novo-rdo-page').then((m) => ({ default: m.NovoRdoPage })),
);
const SitemapPage = lazy(() =>
  import('@/pages/sitemap-page').then((m) => ({ default: m.SitemapPage })),
);

function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress color="primary" />
    </Box>
  );
}

function WithSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/setup',
    element: (
      <WithSuspense>
        <SetupPage />
      </WithSuspense>
    ),
  },
  {
    path: '/',
    element: (
      <WithSuspense>
        <TabletShell />
      </WithSuspense>
    ),
    children: [
      {
        index: true,
        element: (
          <WithSuspense>
            <DashboardPage />
          </WithSuspense>
        ),
      },
      {
        path: 'selecionar',
        element: (
          <WithSuspense>
            <SelectorPage />
          </WithSuspense>
        ),
      },
      {
        path: 'apontar/:codparc',
        element: (
          <WithSuspense>
            <ApontamentoPage />
          </WithSuspense>
        ),
      },
      {
        path: 'configuracoes',
        element: (
          <WithSuspense>
            <ConfiguracoesPage />
          </WithSuspense>
        ),
      },
      {
        path: 'novo-rdo',
        element: (
          <WithSuspense>
            <NovoRdoPage />
          </WithSuspense>
        ),
      },
      {
        path: 'parceiros',
        element: (
          <WithSuspense>
            <ParceirosPage />
          </WithSuspense>
        ),
      },
      {
        path: 'veiculos-tabela',
        element: (
          <WithSuspense>
            <VeiculosTabelaPage />
          </WithSuspense>
        ),
      },
      {
        path: 'guindautos',
        element: (
          <WithSuspense>
            <GuindautosPage />
          </WithSuspense>
        ),
      },
      {
        path: 'veiculos-placas',
        element: (
          <WithSuspense>
            <VeiculosPlacasPage />
          </WithSuspense>
        ),
      },
      {
        path: 'sitemap',
        element: (
          <WithSuspense>
            <SitemapPage />
          </WithSuspense>
        ),
      },
    ],
  },
]);
