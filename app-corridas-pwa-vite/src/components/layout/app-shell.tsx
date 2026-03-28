import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
} from '@mui/material';
import {
  Home,
  ListAlt,
  Map,
  AddCircleOutline,
  Person,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

const routes = [
  { label: 'Inicio', icon: <Home />, path: '/' },
  { label: 'Corridas', icon: <ListAlt />, path: '/corridas' },
  { label: 'Mapa', icon: <Map />, path: '/mapa' },
  { label: 'Nova', icon: <AddCircleOutline />, path: '/nova' },
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

  const gpsActive = Boolean(localStorage.getItem('gps-sharing-active'));

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
        <Toolbar sx={{ gap: 1.5, minHeight: 56, px: 2 }}>
          <Badge
            overlap="circular"
            variant="dot"
            invisible={!gpsActive}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{
              '& .MuiBadge-dot': {
                bgcolor: 'success.main',
                width: 10,
                height: 10,
                borderRadius: '50%',
                border: '2px solid',
                borderColor: 'background.paper',
              },
            }}
          >
            <FuncionarioAvatar codparc={user?.codparc} nome={user?.nome} size="small" />
          </Badge>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap sx={{ lineHeight: 1.3 }}>
              {user?.nome ?? user?.username ?? 'Usuario'}
            </Typography>
            {user?.pertencedp && (
              <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: '0.7rem' }}>
                {user.pertencedp}
              </Typography>
            )}
          </Box>
          <Typography
            sx={{
              fontFamily: "'STOP', 'Arial Black', sans-serif",
              fontSize: 16,
              color: 'primary.main',
              letterSpacing: '0.08em',
              fontWeight: 900,
            }}
          >
            GIGANTAO
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: 'grey.50', '[data-mui-color-scheme="dark"] &': { bgcolor: 'background.default' } }}>
        <Outlet />
      </Box>

      <Paper
        elevation={8}
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
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 0,
              py: 1,
              gap: 0.25,
              transition: 'color 0.2s',
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.65rem',
              '&.Mui-selected': { fontSize: '0.65rem' },
            },
            '& .Mui-selected': {
              '& .MuiSvgIcon-root': { transform: 'scale(1.1)' },
            },
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
