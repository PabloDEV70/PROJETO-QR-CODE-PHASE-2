import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Badge, BottomNavigation, BottomNavigationAction,
  Paper, alpha,
} from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import { getPendingCount, getFailedCount } from '@/utils/offline-queue';

const ROUTES = ['/', '/meus-rdos', '/meu-wrench-time', '/perfil'];

function pathToValue(pathname: string): number {
  if (pathname === '/') return 0;
  if (pathname.startsWith('/meus-rdos') || pathname.startsWith('/rdo/')) return 1;
  if (pathname.startsWith('/meu-wrench-time') || pathname.startsWith('/wrench-time')) return 2;
  return 3;
}

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const value = pathToValue(pathname);
  const [offlineCount, setOfflineCount] = useState(0);
  const [hasActiveActivity, setHasActiveActivity] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      const pending = await getPendingCount();
      const failed = await getFailedCount();
      setOfflineCount(pending + failed);
      const active = sessionStorage.getItem('active-activity') === 'true';
      setHasActiveActivity(active);
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Paper
      sx={(theme) => {
        const isDark = theme.palette.mode === 'dark';
        return {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          border: 'none',
          borderTop: 'none',
          bgcolor: isDark ? '#141414' : '#FFFFFF',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxShadow: isDark
            ? `0 -1px 0 ${alpha('#fff', 0.06)}, 0 -4px 16px ${alpha('#000', 0.5)}`
            : `0 -1px 0 ${alpha('#000', 0.05)}, 0 -4px 16px ${alpha('#000', 0.08)}`,
        };
      }}
      elevation={0}
    >
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => navigate(ROUTES[newValue])}
        showLabels
        sx={(theme) => {
          const isDark = theme.palette.mode === 'dark';
          const primary = theme.palette.primary.main;
          return {
            height: 60,
            bgcolor: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              color: 'text.disabled',
              minWidth: 0,
              py: 0.75,
              transition: 'all 200ms ease',
              '& .MuiBottomNavigationAction-label': {
                fontSize: 10.5,
                fontWeight: 500,
                letterSpacing: '0.02em',
                transition: 'all 200ms ease',
              },
              '& .MuiSvgIcon-root': {
                fontSize: 22,
                transition: 'all 200ms ease',
              },
            },
            '& .Mui-selected': {
              color: primary,
              '& .MuiBottomNavigationAction-label': {
                fontSize: 10.5,
                fontWeight: 700,
              },
              '& .MuiSvgIcon-root': {
                fontSize: 24,
                filter: isDark
                  ? `drop-shadow(0 0 6px ${alpha(primary, 0.5)})`
                  : `drop-shadow(0 1px 3px ${alpha(primary, 0.3)})`,
              },
            },
          };
        }}
      >
        <BottomNavigationAction
          label="Hoje"
          icon={
            <Badge
              variant="dot"
              invisible={!hasActiveActivity}
              sx={{
                '& .MuiBadge-dot': {
                  bgcolor: '#16A34A',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  animation: hasActiveActivity ? 'bottomnav-pulse 2s ease-in-out infinite' : 'none',
                  '@keyframes bottomnav-pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.4 },
                  },
                },
              }}
            >
              <TodayIcon />
            </Badge>
          }
        />
        <BottomNavigationAction label="Historico" icon={<HistoryIcon />} />
        <BottomNavigationAction label="Desempenho" icon={<BarChartIcon />} />
        <BottomNavigationAction label="Perfil" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
