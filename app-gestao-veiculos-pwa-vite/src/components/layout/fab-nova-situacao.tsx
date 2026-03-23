import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Fab, Typography, alpha, Badge, Backdrop, Paper,
} from '@mui/material';
import {
  Build, Storefront, LocalShipping, PrecisionManufacturing,
  ShoppingCart, Add, Close, Security, CalendarMonth,
} from '@mui/icons-material';
import { getPendingCount, getFailedCount } from '@/utils/offline-queue';

const ACTIONS = [
  { key: 'comercial', label: 'Comercial', icon: <Storefront />, color: '#c62828', bg: '#ffebee' },
  { key: 'logistica', label: 'Logistica', icon: <LocalShipping />, color: '#00838f', bg: '#e0f7fa' },
  { key: 'manutencao', label: 'Manutencao', icon: <Build />, color: '#ff9800', bg: '#fff3e0' },
  { key: 'operacao', label: 'Operacao', icon: <PrecisionManufacturing />, color: '#00bcd4', bg: '#e0f7fa' },
  { key: 'seguranca', label: 'Seguranca', icon: <Security />, color: '#6a1b9a', bg: '#f3e5f5' },
  { key: 'programacao', label: 'Programacao', icon: <CalendarMonth />, color: '#0277bd', bg: '#e1f5fe' },
  { key: 'compras', label: 'Compras', icon: <ShoppingCart />, color: '#f9a825', bg: '#fffde7' },
] as const;

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

  const handleSelect = (key: string) => {
    setOpen(false);
    navigate(`/nova-situacao?dep=${key}`);
  };

  return (
    <>
      {/* Backdrop escuro — fecha ao clicar fora */}
      <Backdrop
        open={open}
        onClick={() => setOpen(false)}
        sx={{
          zIndex: 1199,
          bgcolor: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Menu de departamentos — cards sólidos */}
      {open && (
        <Box sx={{
          position: 'fixed',
          bottom: 'calc(130px + env(safe-area-inset-bottom, 0px))',
          right: 16,
          zIndex: 1201,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'flex-end',
        }}>
          {/* Título */}
          <Paper sx={{
            px: 2, py: 1, borderRadius: 2, mb: 0.5,
            bgcolor: (t) => t.palette.mode === 'dark' ? '#1a2e1a' : '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
              Novo Registro
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
              Selecione o departamento
            </Typography>
          </Paper>

          {/* Botões de departamento */}
          {ACTIONS.map((action) => (
            <Paper
              key={action.key}
              onClick={() => handleSelect(action.key)}
              sx={(t) => {
                const isDark = t.palette.mode === 'dark';
                return {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  pl: 1.5,
                  pr: 2.5,
                  py: 1.25,
                  borderRadius: 2,
                  cursor: 'pointer',
                  minWidth: 200,
                  bgcolor: isDark ? alpha(action.color, 0.12) : action.bg,
                  border: `2px solid ${alpha(action.color, isDark ? 0.3 : 0.25)}`,
                  boxShadow: `0 2px 12px ${alpha(action.color, 0.2)}`,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    transform: 'translateX(-4px) scale(1.02)',
                    bgcolor: isDark ? alpha(action.color, 0.2) : alpha(action.color, 0.12),
                    borderColor: action.color,
                    boxShadow: `0 4px 20px ${alpha(action.color, 0.35)}`,
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                };
              }}
            >
              <Box sx={{
                width: 40, height: 40, borderRadius: 1.5,
                bgcolor: (t) => alpha(action.color, t.palette.mode === 'dark' ? 0.2 : 0.15),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: action.color,
                flexShrink: 0,
              }}>
                {action.icon}
              </Box>
              <Typography sx={{
                fontSize: 15, fontWeight: 700, color: action.color,
                letterSpacing: 0.3,
              }}>
                {action.label}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      {/* FAB principal */}
      <Fab
        color="primary"
        onClick={() => setOpen((o) => !o)}
        sx={{
          position: 'fixed',
          bottom: 'calc(68px + env(safe-area-inset-bottom, 0px))',
          right: 16,
          zIndex: 1201,
          width: 56,
          height: 56,
          boxShadow: open
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 14px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
      >
        <Badge
          badgeContent={offlineCount}
          color="error"
          max={9}
          invisible={offlineCount === 0}
          sx={{ '& .MuiBadge-badge': { fontSize: 9, minWidth: 16, height: 16, p: 0 } }}
        >
          {open ? <Close /> : <Add />}
        </Badge>
      </Fab>
    </>
  );
}
