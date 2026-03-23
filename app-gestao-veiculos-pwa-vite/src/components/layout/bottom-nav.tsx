import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper, alpha } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';

const ROUTES = ['/', '/veiculos', '/agenda', '/registros', '/operadores'];

function pathToValue(pathname: string): number {
  if (pathname === '/') return 0;
  if (pathname.startsWith('/veiculos') || pathname.startsWith('/veiculo/')) return 1;
  if (pathname.startsWith('/agenda')) return 2;
  if (pathname.startsWith('/registros') || pathname.startsWith('/situacao/')) return 3;
  if (pathname.startsWith('/operadores')) return 4;
  return -1;
}

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const value = pathToValue(pathname);

  return (
    <Paper sx={(theme) => {
      const isDark = theme.palette.mode === 'dark';
      return {
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100,
        bgcolor: isDark ? '#0f1a0f' : '#f0fdf4',
        borderTop: `1px solid ${isDark ? alpha('#16a34a', 0.2) : alpha('#16a34a', 0.15)}`,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: isDark ? `0 -2px 12px ${alpha('#000', 0.4)}` : `0 -2px 12px ${alpha('#15803d', 0.08)}`,
      };
    }} elevation={0}>
      <BottomNavigation value={value} onChange={(_, v) => navigate(ROUTES[v]!)} showLabels sx={(theme) => {
        const isDark = theme.palette.mode === 'dark';
        const active = isDark ? '#4ade80' : '#16a34a';
        return {
          height: 56, bgcolor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            color: isDark ? alpha('#fff', 0.4) : alpha('#15803d', 0.45),
            minWidth: 0, py: 0.5, px: 0, transition: 'all 150ms ease',
            '& .MuiBottomNavigationAction-label': { fontSize: 9, fontWeight: 600, letterSpacing: '0.02em' },
            '& .MuiSvgIcon-root': { fontSize: 20 },
          },
          '& .Mui-selected': {
            color: `${active} !important`,
            '& .MuiBottomNavigationAction-label': { fontSize: 9, fontWeight: 800 },
            '& .MuiSvgIcon-root': { fontSize: 22, filter: `drop-shadow(0 1px 4px ${alpha(active, 0.4)})` },
          },
        };
      }}>
        <BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} />
        <BottomNavigationAction label="Veiculos" icon={<DirectionsCarIcon />} />
        <BottomNavigationAction label="Agenda" icon={<CalendarMonthIcon />} />
        <BottomNavigationAction label="Registros" icon={<HistoryIcon />} />
        <BottomNavigationAction label="Equipe" icon={<PeopleIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
