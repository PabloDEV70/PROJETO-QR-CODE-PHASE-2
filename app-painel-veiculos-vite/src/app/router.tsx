import { createBrowserRouter } from 'react-router-dom';
import { PainelShell } from '@/components/layout/painel-shell';
import { LoginPage } from '@/pages/login-page';
import { RodizioPage } from '@/pages/rodizio-page';
import { GridPage } from '@/pages/grid-page';
import { AeroportoPage } from '@/pages/aeroporto-page';
import { MosaicoPage } from '@/pages/mosaico-page';
import { KanbanPage } from '@/pages/kanban-page';
import { KpiPage } from '@/pages/kpi-page';
import { UrgentesPage } from '@/pages/urgentes-page';
import { QuadroPage } from '@/pages/quadro-page';
import { CrudPage } from '@/pages/crud-page';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <PainelShell />,
    children: [
      { index: true, element: <RodizioPage /> },
      { path: 'grid', element: <GridPage /> },
      { path: 'aeroporto', element: <AeroportoPage /> },
      { path: 'status', element: <MosaicoPage /> },
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'kpi', element: <KpiPage /> },
      { path: 'urgentes', element: <UrgentesPage /> },
      { path: 'quadro', element: <QuadroPage /> },
      { path: 'crud', element: <CrudPage /> },
    ],
  },
]);
