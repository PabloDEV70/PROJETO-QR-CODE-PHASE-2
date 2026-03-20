import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { RouteErrorBoundary } from '@/components/shared/route-error-boundary';

const LoginPage = lazy(() => import('@/pages/login-page'));
const HomePage = lazy(() => import('@/pages/home-page'));
const UsuariosPage = lazy(() => import('@/pages/usuarios-page'));
const UsuarioDetailPage = lazy(() => import('@/pages/usuario-detail-page'));
const PermissoesPage = lazy(() => import('@/pages/permissoes-page'));
const CompararPage = lazy(() => import('@/pages/comparar-page'));
const InvestigarDocumentoPage = lazy(() => import('@/pages/investigar-documento-page'));
const SitemapPage = lazy(() => import('@/pages/sitemap-page'));
const PerfilPage = lazy(() => import('@/pages/perfil-page'));

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
      { path: 'usuarios', element: <UsuariosPage /> },
      { path: 'usuarios/:codUsu', element: <UsuarioDetailPage /> },
      { path: 'permissoes', element: <PermissoesPage /> },
      { path: 'comparar', element: <CompararPage /> },
      { path: 'investigar', element: <InvestigarDocumentoPage /> },
      { path: 'sitemap', element: <SitemapPage /> },
      { path: 'perfil', element: <PerfilPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
