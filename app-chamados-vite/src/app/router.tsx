import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { AppShell } from '@/components/layout/app-shell';
import { ChatShell } from '@/components/chat/chat-shell';
import { ProtectedRoute } from '@/components/layout/protected-route';

const LoginPage = lazy(() =>
  import('@/pages/login-page').then((m) => ({ default: m.LoginPage })),
);

const ChamadosPage = lazy(() =>
  import('@/pages/chamados-page').then((m) => ({ default: m.ChamadosPage })),
);

const ChamadoDetailPage = lazy(() =>
  import('@/pages/chamado-detail-page').then((m) => ({ default: m.ChamadoDetailPage })),
);

const ChamadosPorSetorPage = lazy(() =>
  import('@/pages/chamados-por-setor-page').then((m) => ({ default: m.ChamadosPorSetorPage })),
);

const ChatPage = lazy(() =>
  import('@/pages/chat-page').then((m) => ({ default: m.ChatPage })),
);

const ChatFormPage = lazy(() =>
  import('@/components/chat/chat-form-page').then((m) => ({ default: m.ChatFormPage })),
);

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress size={32} />
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
        <ChatShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'chamados/chat',
        element: (
          <Suspense fallback={<Loading />}>
            <ChatPage />
          </Suspense>
        ),
      },
      {
        path: 'chamados/chat/novo',
        element: (
          <Suspense fallback={<Loading />}>
            <ChatFormPage />
          </Suspense>
        ),
      },
      {
        path: 'chamados/chat/:nuchamado',
        element: (
          <Suspense fallback={<Loading />}>
            <ChatPage />
          </Suspense>
        ),
      },
    ],
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
        element: <Navigate to="/chamados/chat" replace />,
      },
      {
        path: 'chamados',
        element: (
          <Suspense fallback={<Loading />}>
            <ChamadosPage />
          </Suspense>
        ),
      },
      {
        path: 'chamados/:nuchamado',
        element: (
          <Suspense fallback={<Loading />}>
            <ChamadoDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'chamados/por-setor',
        element: (
          <Suspense fallback={<Loading />}>
            <ChamadosPorSetorPage />
          </Suspense>
        ),
      },
      { path: '*', element: <Navigate to="/chamados/chat" replace /> },
    ],
  },
]);
