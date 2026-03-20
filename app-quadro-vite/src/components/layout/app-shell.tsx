import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/layout/app-header';

declare const __APP_VERSION__: string;
declare const __COMMIT_SHORT__: string;

export function AppShell() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <AppHeader />
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Outlet />
      </Box>
      <Box sx={{ textAlign: 'center', py: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box component="span" sx={{ fontSize: 11, color: 'text.disabled' }}>
          quadro.gigantao.net &middot; v{__APP_VERSION__} ({__COMMIT_SHORT__})
        </Box>
      </Box>
    </Box>
  );
}
