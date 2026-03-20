import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge, BottomNavigation, BottomNavigationAction, Paper, alpha } from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import HistoryIcon from '@mui/icons-material/History';
import BuildIcon from '@mui/icons-material/Build';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { getPendingCount, getFailedCount } from '@/utils/offline-queue';

const ROUTES = ['/', '/meus-rdos', '/os-man', '/produtos'];

function pathToValue(pathname: string): number {
  if (pathname === '/') return 0;
  if (pathname.startsWith('/meus-rdos') || pathname.startsWith('/rdo/')) return 1;
  if (pathname.startsWith('/os-man')) return 2;
  if (pathname.startsWith('/produtos')) return 3;
  return -1;
}

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const value = pathToValue(pathname);
  const [hasActiveActivity, setHasActiveActivity] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    const refresh = async () => {
      const pending = await getPendingCount();
      const failed = await getFailedCount();
      setOfflineCount(pending + failed);
      setHasActiveActivity(sessionStorage.getItem('active-activity') === 'true');
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Paper sx={(theme) => {
      const isDark = theme.palette.mode === 'dark';
      return {
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100,
        bgcolor: isDark ? '#0f1a0f' : '#f0fdf4',
        borderTop: `1px solid ${isDark ? alpha('#16a34a', 0.2) : alpha('#16a34a', 0.15)}`,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: isDark
          ? `0 -2px 12px ${alpha('#000', 0.4)}`
          : `0 -2px 12px ${alpha('#15803d', 0.08)}`,
      };
    }} elevation={0}>
      <BottomNavigation value={value} onChange={(_, v) => navigate(ROUTES[v]!)} showLabels sx={(theme) => {
        const isDark = theme.palette.mode === 'dark';
        const active = isDark ? '#4ade80' : '#16a34a';
        return {
          height: 56, bgcolor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            color: isDark ? alpha('#fff', 0.4) : alpha('#15803d', 0.45),
            minWidth: 0, py: 0.5, transition: 'all 150ms ease',
            '& .MuiBottomNavigationAction-label': {
              fontSize: 10, fontWeight: 600, letterSpacing: '0.03em', transition: 'all 150ms ease',
            },
            '& .MuiSvgIcon-root': { fontSize: 22, transition: 'all 150ms ease' },
          },
          '& .Mui-selected': {
            color: `${active} !important`,
            '& .MuiBottomNavigationAction-label': { fontSize: 10, fontWeight: 800 },
            '& .MuiSvgIcon-root': {
              fontSize: 24,
              filter: `drop-shadow(0 1px 4px ${alpha(active, 0.4)})`,
            },
          },
        };
      }}>
        <BottomNavigationAction label="Hoje" icon={
          <Badge variant="dot" invisible={!hasActiveActivity} sx={{
            '& .MuiBadge-dot': {
              bgcolor: '#16A34A', width: 7, height: 7, borderRadius: '50%',
              animation: hasActiveActivity ? 'bnav-pulse 2s ease-in-out infinite' : 'none',
              '@keyframes bnav-pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
            },
          }}>
            <TodayIcon />
          </Badge>
        } />
        <BottomNavigationAction label="Historico" icon={<HistoryIcon />} />
        <BottomNavigationAction label="OS Man." icon={
          <Badge badgeContent={offlineCount} color="error" max={9} invisible={offlineCount === 0} sx={{
            '& .MuiBadge-badge': { fontSize: 8, minWidth: 14, height: 14, p: 0 },
          }}>
            <BuildIcon />
          </Badge>
        } />
        <BottomNavigationAction label="Produtos" icon={<Inventory2Icon />} />
      </BottomNavigation>
    </Paper>
  );
}
