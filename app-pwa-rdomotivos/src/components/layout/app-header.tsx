import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Stack, Typography, IconButton, alpha, keyframes,
} from '@mui/material';
import { Menu as MenuIcon, Circle } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { AppDrawer } from '@/components/layout/app-drawer';
import type { DatabaseEnv } from '@/types/auth-types';

const DB_META: Record<DatabaseEnv, { color: string; label: string }> = {
  PROD: { color: '#16a34a', label: 'PROD' },
  TESTE: { color: '#ea580c', label: 'TESTE' },
  TREINA: { color: '#7c3aed', label: 'TREINA' },
};

const pulse = keyframes`0%,100%{opacity:1}50%{opacity:0.4}`;

export function AppHeader() {
  const navigate = useNavigate();
  const { user, database } = useAuthStore();
  const { mode } = useThemeStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isDark = mode === 'dark';
  const meta = DB_META[database];
  const displayName = user?.nome || user?.username || '?';

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: isDark
          ? 'linear-gradient(180deg, #14532d 0%, #166534 100%)'
          : 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)',
        background: isDark
          ? 'linear-gradient(180deg, #14532d 0%, #166534 100%)'
          : 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)',
        color: '#fff',
        boxShadow: isDark
          ? `0 2px 12px ${alpha('#000', 0.5)}`
          : `0 2px 12px ${alpha('#15803d', 0.35)}`,
      }}>
        <Toolbar sx={{ minHeight: '50px !important', height: 50, px: { xs: 1.5, sm: 2 }, gap: 0.75 }}>
          {/* Hamburger */}
          <IconButton
            onClick={() => setDrawerOpen(true)}
            size="small"
            sx={{ color: '#fff', mr: 0.25, '&:hover': { bgcolor: alpha('#fff', 0.1) } }}
          >
            <MenuIcon sx={{ fontSize: 22 }} />
          </IconButton>

          {/* Logo */}
          <Stack
            direction="row" alignItems="center" spacing={0.75}
            onClick={() => navigate('/')}
            sx={{ flexShrink: 0, cursor: 'pointer', userSelect: 'none' }}
          >
            <Box sx={{
              width: 28, height: 28, borderRadius: '7px',
              bgcolor: alpha('#fff', 0.2),
              border: `1.5px solid ${alpha('#fff', 0.3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography sx={{
                fontFamily: "'STOP', 'Arial Black', sans-serif",
                fontSize: 16, fontWeight: 900, lineHeight: 1, color: '#fff',
              }}>
                G
              </Typography>
            </Box>
            <Typography sx={{
              fontFamily: "'STOP', 'Arial Black', sans-serif",
              fontSize: 13, fontWeight: 900, letterSpacing: '0.08em',
              color: '#fff', lineHeight: 1,
            }}>
              GIGANTAO
            </Typography>
          </Stack>

          <Box sx={{ flex: 1 }} />

          {/* DB dot indicator */}
          {database !== 'PROD' && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.4,
              px: 0.6, py: 0.2, borderRadius: 1,
              bgcolor: alpha('#fff', 0.15),
            }}>
              <Circle sx={{ fontSize: 6, color: meta.color, animation: `${pulse} 2s ease-in-out infinite` }} />
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                {meta.label}
              </Typography>
            </Box>
          )}

          {/* Avatar (opens drawer too) */}
          <IconButton onClick={() => setDrawerOpen(true)} size="small" sx={{ '&:hover': { opacity: 0.85 } }}>
            <FuncionarioAvatar
              codparc={user?.codparc}
              codemp={user?.codemp}
              codfunc={user?.codfunc}
              nome={displayName}
              size="small"
              sx={{
                width: 30, height: 30,
                border: `2px solid ${alpha('#fff', 0.5)}`,
              }}
            />
          </IconButton>
        </Toolbar>
      </AppBar>

      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
