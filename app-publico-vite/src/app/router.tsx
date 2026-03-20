import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '@/pages/home-page';
import { ArmarioPublicPage } from '@/pages/armario-public-page';
import { NotFoundPage } from '@/pages/not-found-page';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/armario/:codarmario', element: <ArmarioPublicPage /> },
  { path: '/p/armario/:codarmario', element: <ArmarioPublicPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
