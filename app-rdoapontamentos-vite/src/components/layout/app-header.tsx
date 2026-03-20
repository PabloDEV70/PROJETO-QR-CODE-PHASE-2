import {
  AppBar, Toolbar, Typography, Box, Stack, IconButton, Tooltip, alpha,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DeleteSweep } from '@mui/icons-material';
import { useThemeStore } from '@/stores/theme-store';
import { UserMenu } from '@/components/layout/user-menu';
import { PageSelector } from '@/components/layout/page-selector';
import { AppBreadcrumb } from '@/components/layout/app-breadcrumb';

async function clearAppCompletely() {
  localStorage.clear();
  sessionStorage.clear();
  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
  }
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }
  window.location.reload();
}

export function AppHeader() {
  const mode = useThemeStore((s) => s.mode);
  const navigate = useNavigate();
  const isDark = mode === 'dark';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: isDark ? '#141414' : '#FFFFFF',
        color: 'text.primary',
        borderBottom: 'none',
        boxShadow: isDark
          ? `0 1px 0 ${alpha('#fff', 0.06)}, 0 4px 12px ${alpha('#000', 0.4)}`
          : `0 1px 0 ${alpha('#000', 0.05)}, 0 4px 12px ${alpha('#000', 0.06)}`,
      }}
    >
      {/* Main toolbar — 52px */}
      <Toolbar
        sx={{
          minHeight: '52px !important',
          height: 52,
          px: { xs: 1.5, sm: 2 },
          gap: 0.75,
        }}
      >
        {/* Left: Logo + Brand */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          onClick={() => navigate('/')}
          sx={{ flexShrink: 0, cursor: 'pointer', userSelect: 'none' }}
        >
          {/* Logo mark */}
          <Box sx={{
            width: 30, height: 30, borderRadius: '8px',
            background: isDark
              ? 'linear-gradient(135deg, #4ADE80 0%, #22c55e 100%)'
              : 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isDark
              ? `0 2px 8px ${alpha('#4ADE80', 0.3)}`
              : `0 2px 8px ${alpha('#2e7d32', 0.25)}`,
          }}>
            <Typography sx={{
              fontFamily: "'STOP', 'Arial Black', sans-serif",
              fontSize: 17, fontWeight: 900, lineHeight: 1,
              color: '#fff',
            }}>
              G
            </Typography>
          </Box>
          <Typography sx={{
            fontFamily: "'STOP', 'Arial Black', sans-serif",
            fontSize: 14, fontWeight: 900, letterSpacing: '0.06em',
            color: 'text.primary', lineHeight: 1, userSelect: 'none',
            display: { xs: 'none', sm: 'block' },
          }}>
            GIGANTAO
          </Typography>
        </Stack>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Right: Clear + PageSelector + Avatar */}
        <Stack direction="row" spacing={0.25} alignItems="center">
          <Tooltip title="Limpar app e recarregar" arrow>
            <IconButton
              onClick={clearAppCompletely}
              size="small"
              sx={{
                borderRadius: '8px',
                color: 'text.disabled',
                width: 32, height: 32,
                '&:hover': {
                  color: 'error.main',
                  bgcolor: (t) => alpha(t.palette.error.main, 0.08),
                },
                transition: 'all 150ms',
              }}
            >
              <DeleteSweep sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <PageSelector />
          <UserMenu />
        </Stack>
      </Toolbar>

      {/* Breadcrumb sub-row — md+ only */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          height: 28,
          px: { xs: 1.5, sm: 2 },
          borderTop: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
          bgcolor: isDark ? alpha('#fff', 0.015) : alpha('#000', 0.015),
        }}
      >
        <AppBreadcrumb />
      </Box>
    </AppBar>
  );
}
