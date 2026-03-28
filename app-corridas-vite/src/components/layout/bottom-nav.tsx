import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  Dashboard, ListAlt, BarChart, DirectionsCar, Add,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const routes = [
  { label: 'Painel', icon: <Dashboard />, path: '/' },
  { label: 'Corridas', icon: <ListAlt />, path: '/corridas' },
  { label: 'Nova', icon: <Add />, path: '/nova-corrida' },
  { label: 'Motorista', icon: <DirectionsCar />, path: '/motorista' },
  { label: 'Stats', icon: <BarChart />, path: '/estatisticas' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = routes.findIndex((r) =>
    r.path === '/' ? location.pathname === '/' : location.pathname.startsWith(r.path),
  );

  return (
    <Paper
      elevation={3}
      sx={{ position: 'sticky', bottom: 0, zIndex: 10, borderTop: '1px solid', borderColor: 'divider' }}
    >
      <BottomNavigation
        value={currentIndex >= 0 ? currentIndex : 0}
        onChange={(_, idx) => navigate(routes[idx].path)}
        showLabels
        sx={{
          '& .MuiBottomNavigationAction-root': { minWidth: 0, py: 0.5 },
          '& .MuiBottomNavigationAction-label': { fontSize: 10 },
        }}
      >
        {routes.map((r) => (
          <BottomNavigationAction key={r.path} label={r.label} icon={r.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
