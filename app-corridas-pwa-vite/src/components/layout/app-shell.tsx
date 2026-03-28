import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  Home,
  ListAlt,
  Map,
  AddCircle,
  Person,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

const routes = [
  { label: 'Inicio', icon: <Home />, path: '/' },
  { label: 'Corridas', icon: <ListAlt />, path: '/corridas' },
  { label: 'Mapa', icon: <Map />, path: '/mapa' },
  { label: 'Nova', icon: <AddCircle />, path: '/nova' },
  { label: 'Perfil', icon: <Person />, path: '/perfil' },
];

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const currentIndex = routes.findIndex((r) => {
    if (r.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(r.path);
  });

  const cargo = user?.pertencedp ?? '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: 48, px: 1.5 }}>
          <FuncionarioAvatar codparc={user?.codparc} nome={user?.nome} size="small" />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
              {user?.nome ?? user?.username ?? 'Usuario'}
              {cargo ? (
                <Typography
                  component="span"
                  sx={{ fontSize: '0.65rem', color: 'text.secondary', ml: 0.5, fontWeight: 400 }}
                >
                  {cargo}
                </Typography>
              ) : null}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: "'STOP', 'Arial Black', sans-serif",
              fontSize: 14,
              color: 'primary.main',
              letterSpacing: '0.06em',
            }}
          >
            GIGANTAO
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Outlet />
      </Box>

      <Paper
        elevation={3}
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <BottomNavigation
          value={currentIndex >= 0 ? currentIndex : false}
          onChange={(_, idx) => navigate(routes[idx].path)}
          showLabels
          sx={{
            '& .MuiBottomNavigationAction-root': {
              minWidth: 0,
              py: 0.5,
              minHeight: 56,
            },
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
