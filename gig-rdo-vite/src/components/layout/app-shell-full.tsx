import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/layout/app-header';

export function AppShellFull() {
  return (
    <>
      <AppHeader />
      <Outlet />
    </>
  );
}
