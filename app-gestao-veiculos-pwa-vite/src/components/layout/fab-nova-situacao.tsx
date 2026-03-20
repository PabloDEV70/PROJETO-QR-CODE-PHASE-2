import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SpeedDial, SpeedDialAction, SpeedDialIcon, alpha, Badge } from '@mui/material';
import {
  Build, Storefront, LocalShipping, PrecisionManufacturing,
  ShoppingCart, Add, Close,
} from '@mui/icons-material';
import { getPendingCount, getFailedCount } from '@/utils/offline-queue';
import { useEffect } from 'react';

const ACTIONS = [
  { key: 'manutencao', label: 'Manutencao', icon: <Build />, color: '#ff9800' },
  { key: 'comercial', label: 'Comercial', icon: <Storefront />, color: '#c62828' },
  { key: 'logistica', label: 'Logistica', icon: <LocalShipping />, color: '#00838f' },
  { key: 'operacao', label: 'Operacao', icon: <PrecisionManufacturing />, color: '#00bcd4' },
  { key: 'compras', label: 'Compras', icon: <ShoppingCart />, color: '#ffc107' },
] as const;

// Hide FAB on form pages
const HIDE_PATHS = ['/nova-situacao', '/login'];

export function FabNovaSituacao() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    const refresh = async () => {
      const pending = await getPendingCount();
      const failed = await getFailedCount();
      setOfflineCount(pending + failed);
    };
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  if (HIDE_PATHS.some((p) => pathname.startsWith(p))) return null;
  if (pathname.includes('/editar')) return null;

  return (
    <SpeedDial
      ariaLabel="Nova situacao"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      icon={
        <Badge
          badgeContent={offlineCount}
          color="error"
          max={9}
          invisible={offlineCount === 0}
          sx={{ '& .MuiBadge-badge': { fontSize: 8, minWidth: 14, height: 14, p: 0 } }}
        >
          <SpeedDialIcon icon={<Add />} openIcon={<Close />} />
        </Badge>
      }
      direction="up"
      sx={{
        position: 'fixed',
        bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        right: 16,
        zIndex: 1200,
        '& .MuiFab-primary': {
          bgcolor: 'primary.main',
          '&:hover': { bgcolor: 'primary.dark' },
          width: 52,
          height: 52,
        },
      }}
    >
      {ACTIONS.map((action) => (
        <SpeedDialAction
          key={action.key}
          icon={action.icon}
          tooltipTitle={action.label}
          tooltipOpen
          onClick={() => {
            setOpen(false);
            navigate(`/nova-situacao?dep=${action.key}`);
          }}
          sx={{
            '& .MuiSvgIcon-root': { color: action.color },
            '& .MuiSpeedDialAction-staticTooltipLabel': {
              whiteSpace: 'nowrap',
              fontWeight: 700,
              fontSize: '0.75rem',
              bgcolor: (t) => alpha(action.color, t.palette.mode === 'dark' ? 0.2 : 0.1),
              color: action.color,
              border: (t) => `1px solid ${alpha(action.color, t.palette.mode === 'dark' ? 0.3 : 0.2)}`,
            },
          }}
        />
      ))}
    </SpeedDial>
  );
}
