import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { RouteErrorBoundary } from '@/components/shared/route-error-boundary';

const LoginPage = lazy(() => import('@/pages/login-page'));
const HomePage = lazy(() => import('@/pages/home-page'));
const MeusRdosPage = lazy(() => import('@/pages/meus-rdos-page'));
const RdoDetailPage = lazy(() => import('@/pages/rdo-detail-page'));
const AdminRdosPage = lazy(() => import('@/pages/admin-rdos-page'));
const AdminMotivosPage = lazy(() => import('@/pages/admin-motivos-page'));
const SitemapPage = lazy(() => import('@/pages/sitemap-page'));
const WrenchTimePage = lazy(() => import('@/pages/wrench-time-page'));
const MeuWrenchTimePage = lazy(() => import('@/pages/meu-wrench-time-page'));
const EscolherAtividadePage = lazy(() => import('@/pages/escolher-atividade-page'));
const AtividadeFormPage = lazy(() => import('@/pages/atividade-form-page'));
const AdminRdoEditPage = lazy(() => import('@/pages/admin-rdo-edit-page'));
const AdminMotivoFormPage = lazy(() => import('@/pages/admin-motivo-form-page'));
const AdminVisualizarComoPage = lazy(() => import('@/pages/admin-visualizar-como-page'));
const CabDetalhamentoPage = lazy(() => import('@/pages/cab-detalhamento-page'));
const OfflinePage = lazy(() => import('@/pages/offline-page'));
const PerfilPage = lazy(() => import('@/pages/perfil-page'));
const WrenchTimeEstudoPage = lazy(() => import('@/pages/wrench-time-estudo-page'));
const WrenchTimeColaboradoresPage = lazy(() => import('@/pages/wrench-time-colaboradores-page'));
const WrenchTimePerdasPage = lazy(() => import('@/pages/wrench-time-perdas-page'));
const WrenchTimeTendenciaPage = lazy(() => import('@/pages/wrench-time-tendencia-page'));
const WrenchTimeDiaPage = lazy(() => import('@/pages/wrench-time-dia-page'));
const WrenchTimeDiaColabPage = lazy(() => import('@/pages/wrench-time-dia-colab-page'));
const VeiculosPlacasPage = lazy(() => import('@/pages/veiculos-placas-page'));

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'meus-rdos', element: <MeusRdosPage /> },
      { path: 'rdo/:codrdo', element: <RdoDetailPage /> },
      { path: 'escolher-atividade', element: <EscolherAtividadePage /> },
      { path: 'atividade-form', element: <AtividadeFormPage /> },
      { path: 'admin', element: <AdminRdosPage /> },
      { path: 'admin/rdoapontamentos', element: <AdminRdosPage /> },
      { path: 'admin/rdo/novo', element: <AdminRdoEditPage /> },
      { path: 'admin/rdo/:codrdo', element: <AdminRdoEditPage /> },
      { path: 'admin/motivos', element: <AdminMotivosPage /> },
      { path: 'admin/visualizar-como', element: <AdminVisualizarComoPage /> },
      { path: 'admin/motivo/:id', element: <AdminMotivoFormPage /> },
      { path: 'meu-wrench-time', element: <MeuWrenchTimePage /> },
      { path: 'wrench-time', element: <WrenchTimePage /> },
      { path: 'wrench-time/estudo', element: <WrenchTimeEstudoPage /> },
      { path: 'wrench-time/colaboradores', element: <WrenchTimeColaboradoresPage /> },
      { path: 'wrench-time/perdas', element: <WrenchTimePerdasPage /> },
      { path: 'wrench-time/tendencia', element: <WrenchTimeTendenciaPage /> },
      { path: 'wrench-time/dia/:dtref', element: <WrenchTimeDiaPage /> },
      { path: 'wrench-time/dia/:dtref/colab/:codparc', element: <WrenchTimeDiaColabPage /> },
      { path: 'cabs/detalhamento-completo', element: <CabDetalhamentoPage /> },
      { path: 'sitemap', element: <SitemapPage /> },
      { path: 'perfil', element: <PerfilPage /> },
      { path: 'offline', element: <OfflinePage /> },
      { path: 'veiculos-placas', element: <VeiculosPlacasPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
