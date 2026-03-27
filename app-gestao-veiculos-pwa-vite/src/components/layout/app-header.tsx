import { useState } from 'react';
import {
  Box, Stack, Typography, IconButton, alpha, keyframes, AppBar, Toolbar,
  Menu, MenuItem, ListItemIcon, ListItemText, Divider, Chip,
} from '@mui/material';
import {
  DarkMode, LightMode, Circle, Logout, DeleteSweep, Settings,
  Storage, Check,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';
import type { DatabaseEnv } from '@shared/ui-lib';

const DB_META: Record<DatabaseEnv, { color: string; label: string }> = {
  PROD: { color: '#16a34a', label: 'PROD' },
  TESTE: { color: '#ea580c', label: 'TESTE' },
  TREINA: { color: '#7c3aed', label: 'TREINA' },
};

const pulse = keyframes`0%,100%{opacity:1}50%{opacity:0.4}`;

const DB_OPTIONS: DatabaseEnv[] = ['PROD', 'TESTE', 'TREINA'];

export function AppHeader() {
  const navigate = useNavigate();
  const { user, database, logout, setDatabase } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const isDark = mode === 'dark';
  const meta = DB_META[database];
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDbChange = (db: DatabaseEnv) => {
    setDatabase(db);
    // Reload to apply new database across all queries
    window.location.reload();
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{
      bgcolor: isDark ? 'linear-gradient(180deg, #14532d 0%, #166534 100%)' : 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)',
      background: isDark ? 'linear-gradient(180deg, #14532d 0%, #166534 100%)' : 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)',
      color: '#fff',
      boxShadow: isDark ? `0 2px 12px ${alpha('#000', 0.5)}` : `0 2px 12px ${alpha('#15803d', 0.35)}`,
    }}>
      <Toolbar sx={{ minHeight: '50px !important', height: 50, px: { xs: 1.5, sm: 2 }, gap: 0.75 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} onClick={() => navigate('/')} sx={{ flexShrink: 0, cursor: 'pointer', userSelect: 'none' }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: alpha('#fff', 0.2), border: `1.5px solid ${alpha('#fff', 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontFamily: "'STOP', 'Arial Black', sans-serif", fontSize: 16, fontWeight: 900, lineHeight: 1, color: '#fff' }}>G</Typography>
          </Box>
          <Typography sx={{ fontFamily: "'STOP', 'Arial Black', sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: '0.08em', color: '#fff', lineHeight: 1 }}>GIGANTAO</Typography>
        </Stack>
        <Box sx={{ flex: 1 }} />
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.4, px: 0.8, py: 0.25, borderRadius: 1,
          bgcolor: database === 'PROD' ? alpha('#fff', 0.1) : alpha(meta.color, 0.25),
          border: database !== 'PROD' ? `1px solid ${alpha(meta.color, 0.5)}` : 'none',
        }}>
          <Circle sx={{
            fontSize: 7, color: database === 'PROD' ? '#4ade80' : meta.color,
            animation: database !== 'PROD' ? `${pulse} 1.5s ease-in-out infinite` : 'none',
          }} />
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
            {meta.label}
          </Typography>
        </Box>
        <IconButton size="small" onClick={toggleTheme} sx={{ color: '#fff' }}>
          {isDark ? <LightMode sx={{ fontSize: 20 }} /> : <DarkMode sx={{ fontSize: 20 }} />}
        </IconButton>

        {/* User avatar + menu */}
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0, ml: 0.25 }}>
          <PessoaAvatar
            codparc={user?.codparc}
            nome={user?.nome ?? user?.username}
            size={30}
            sx={{ border: '2px solid', borderColor: alpha('#fff', 0.5) }}
          />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{ paper: { sx: { mt: 0.5, minWidth: 200 } } }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {user?.nome ?? user?.username ?? '—'}
            </Typography>
            {user?.nomegrupo && (
              <Typography variant="caption" color="text.secondary">
                {user.nomegrupo}
              </Typography>
            )}
          </Box>
          <Divider />

          {/* Database selector */}
          <Box sx={{ px: 2, py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <Storage sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Base de dados
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              {DB_OPTIONS.map((db) => {
                const dbMeta = DB_META[db];
                const isActive = database === db;
                return (
                  <Chip
                    key={db}
                    label={dbMeta.label}
                    icon={isActive ? <Check sx={{ fontSize: '14px !important' }} /> : undefined}
                    onClick={() => { if (!isActive) handleDbChange(db); }}
                    size="small"
                    sx={{
                      flex: 1,
                      height: 32,
                      fontSize: 12,
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      cursor: isActive ? 'default' : 'pointer',
                      bgcolor: isActive ? alpha(dbMeta.color, 0.15) : 'transparent',
                      color: isActive ? dbMeta.color : 'text.disabled',
                      border: `2px solid ${isActive ? dbMeta.color : alpha(dbMeta.color, 0.2)}`,
                      '&:hover': isActive ? {} : {
                        bgcolor: alpha(dbMeta.color, 0.08),
                        borderColor: alpha(dbMeta.color, 0.5),
                        color: dbMeta.color,
                      },
                      '& .MuiChip-icon': { color: `${dbMeta.color} !important` },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
          <Divider />

          <MenuItem onClick={() => { setAnchorEl(null); navigate('/config'); }}>
            <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
            <ListItemText>Configuracoes</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            setAnchorEl(null);
            if (confirm('Limpar cache, Service Worker e dados locais?')) {
              // Clear SW
              navigator.serviceWorker?.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
              // Clear caches
              caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
              // Clear storage
              localStorage.clear();
              sessionStorage.clear();
              // Reload
              setTimeout(() => window.location.href = '/login', 500);
            }
          }}>
            <ListItemIcon><DeleteSweep fontSize="small" sx={{ color: '#e65100' }} /></ListItemIcon>
            <ListItemText sx={{ color: '#e65100' }}>Limpar tudo</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><Logout fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
            <ListItemText>Sair</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
