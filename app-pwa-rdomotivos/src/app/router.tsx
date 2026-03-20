import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { RouteErrorBoundary } from '@/components/shared/route-error-boundary';

const LoginPage = lazy(() => import('@/pages/login-page'));
const HomePage = lazy(() => import('@/pages/home-page'));
const MeusRdosPage = lazy(() => import('@/pages/meus-rdos-page'));
const RdoDetailPage = lazy(() => import('@/pages/rdo-detail-page'));
const OsManPage = lazy(() => import('@/pages/os-man-page'));
const PerfilPage = lazy(() => import('@/pages/perfil-page'));
const ConfigPage = lazy(() => import('@/pages/config-page'));
const AdminVerComoPage = lazy(() => import('@/pages/admin-ver-como-page'));
const AdminEquipePage = lazy(() => import('@/pages/admin-equipe-page'));
const AdminQuemFazPage = lazy(() => import('@/pages/admin-quem-faz-page'));
const ProdutosPage = lazy(() => import('@/pages/produtos-page'));

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage />, errorElement: <RouteErrorBoundary /> },
  {
    path: '/', element: <AppShell />, errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'meus-rdos', element: <MeusRdosPage /> },
      { path: 'rdo/:codrdo', element: <RdoDetailPage /> },
      { path: 'os-man', element: <OsManPage /> },
      { path: 'produtos', element: <ProdutosPage /> },
      { path: 'perfil', element: <PerfilPage /> },
      { path: 'configuracoes', element: <ConfigPage /> },
      { path: 'admin/ver-como', element: <AdminVerComoPage /> },
      { path: 'admin/equipe', element: <AdminEquipePage /> },
      { path: 'admin/quem-faz', element: <AdminQuemFazPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
