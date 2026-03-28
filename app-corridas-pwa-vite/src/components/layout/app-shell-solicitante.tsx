import { Box, AppBar, Toolbar, Typography, IconButton, Stack, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Add, ListAlt, DarkMode, LightMode } from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

const routes = [
  { label: 'Solicitar', icon: <Add />, path: '/solicitar' },
  { label: 'Minhas', icon: <ListAlt />, path: '/minhas' },
];

export function AppShellSolicitante() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const currentIndex = routes.findIndex((r) => location.pathname.startsWith(r.path));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Toolbar sx={{ gap: 1, minHeight: 52, px: 1.5 }}>
          <FuncionarioAvatar codparc={user?.codparc} nome={user?.nome} size="small" />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {user?.nome ?? user?.username ?? 'Usuario'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.pertencedp ?? 'Solicitante'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography
              sx={{ fontFamily: "'STOP', 'Arial Black', sans-serif", fontSize: 14, color: 'primary.main', letterSpacing: '0.06em' }}
            >
              GIGANTAO
            </Typography>
            <IconButton onClick={toggleTheme} size="small">
              {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Outlet />
      </Box>

      <Paper elevation={3} sx={{ position: 'sticky', bottom: 0, zIndex: 10, borderTop: '1px solid', borderColor: 'divider' }}>
        <BottomNavigation
          value={currentIndex >= 0 ? currentIndex : 0}
          onChange={(_, idx) => navigate(routes[idx].path)}
          showLabels
          sx={{
            '& .MuiBottomNavigationAction-root': { minWidth: 0, py: 0.5, minHeight: 56 },
            '& .MuiBottomNavigationAction-label': { fontSize: 11 },
          }}
        >
          {routes.map((r) => (
            <BottomNavigationAction key={r.path} label={r.label} icon={r.icon} />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
