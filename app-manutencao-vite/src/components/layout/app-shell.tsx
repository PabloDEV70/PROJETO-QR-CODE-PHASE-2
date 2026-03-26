import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/layout/app-header';

export function AppShell() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <AppHeader />
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
