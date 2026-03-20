import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/layout/app-header';

export function AppShell() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader />
      <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
        <Outlet />
      </Container>
      <Box sx={{ textAlign: 'center', py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box component="span" sx={{ fontSize: 11, color: 'text.disabled' }}>
          etiquetas.gigantao.net &middot; v{__APP_VERSION__} ({__COMMIT_SHORT__})
        </Box>
      </Box>
    </Box>
  );
}
