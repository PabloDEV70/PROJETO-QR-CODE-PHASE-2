import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  IconButton, Menu, MenuItem, ListItemIcon,
  Divider, Typography, Box, Stack, alpha, keyframes,
} from '@mui/material';
import {
  Logout, Person, Dashboard, ListAlt, Map, Visibility,
  DarkMode, LightMode, Circle, Check,
} from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { DatabaseEnv } from '@shared/ui-lib';

const DB_META: Record<DatabaseEnv, { color: string; label: string }> = {
  PROD: { color: '#16a34a', label: 'PROD' },
  TESTE: { color: '#ea580c', label: 'TESTE' },
  TREINA: { color: '#7c3aed', label: 'TREINA' },
};
const DB_ORDER: DatabaseEnv[] = ['PROD', 'TESTE', 'TREINA'];

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

export function UserMenu() {
  const { user, logout, isAdmin, impersonating, database, setDatabase, stopImpersonating } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const displayName = user?.nome || user?.username || '?';
  const subtitle = [user?.pertencedp, user?.cargo].filter(Boolean).join(' · ') || user?.username || 'Usuario do Sistema';
  const isDark = mode === 'dark';
  const meta = DB_META[database];

  const handleNav = (path: string) => {
    setAnchorEl(null);
    navigate(path);
  };

  const handleVisualizarComo = () => {
    setAnchorEl(null);
    if (impersonating) {
      stopImpersonating();
      setSearchParams({});
    } else {
      navigate('/admin/visualizar-como');
    }
  };

  const handleDatabaseChange = (db: DatabaseEnv) => {
    setDatabase(db);
    queryClient.invalidateQueries();
  };

  const menuItemSx = {
    fontSize: 13,
    py: 0.75,
    borderRadius: '8px',
    mx: 0.5,
  };

  return (
    <>
      {/* Avatar button — show DB color ring when not PROD */}
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="small"
        sx={{
          '&:hover': { opacity: 0.8 },
          transition: 'opacity 0.2s',
        }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <FuncionarioAvatar
          codparc={user?.codparc}
          codemp={user?.codemp}
          codfunc={user?.codfunc}
          nome={displayName}
          size="small"
          sx={{
            width: 28, height: 28,
            ...(isAdmin && {
              border: (theme) => `1.5px solid ${theme.palette.primary.main}`,
            }),
          }}
        />
      </IconButton>

      {/* DB indicator dot next to avatar — visible in header */}
      {database !== 'PROD' && (
        <Circle
          sx={{
            fontSize: 6,
            color: meta.color,
            ml: -0.5,
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        />
      )}

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1,
              minWidth: 240,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 4px 24px rgba(0,0,0,0.4)'
                  : '0 4px 24px rgba(0,0,0,0.08)',
            },
          },
        }}
      >
        {/* User info */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FuncionarioAvatar
            codparc={user?.codparc}
            codemp={user?.codemp}
            codfunc={user?.codfunc}
            nome={displayName}
            size="medium"
          />
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>

        {/* Database selector — 3 pill buttons */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 10 }}
          >
            Ambiente
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.75 }}>
            {DB_ORDER.map((db) => {
              const m = DB_META[db];
              const selected = database === db;
              return (
                <Box
                  key={db}
                  onClick={() => handleDatabaseChange(db)}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    py: 0.5,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selected ? m.color : 'divider',
                    bgcolor: selected ? alpha(m.color, 0.1) : 'transparent',
                    transition: 'all 150ms ease',
                    '&:hover': { bgcolor: alpha(m.color, 0.06) },
                  }}
                >
                  {selected
                    ? <Check sx={{ fontSize: 10, color: m.color }} />
                    : <Circle sx={{ fontSize: 5, color: m.color }} />}
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: selected ? 700 : 500,
                      color: selected ? m.color : 'text.secondary',
                      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
                      letterSpacing: '0.04em',
                      userSelect: 'none',
                    }}
                  >
                    {db}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>
        <Divider />

        {/* Admin section */}
        {isAdmin && (
          <MenuItem onClick={() => handleNav('/admin')} sx={menuItemSx}>
            <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
            Painel Admin
          </MenuItem>
        )}
        {isAdmin && (
          <MenuItem onClick={() => handleNav('/admin/motivos')} sx={menuItemSx}>
            <ListItemIcon><ListAlt fontSize="small" /></ListItemIcon>
            Motivos RDO
          </MenuItem>
        )}
        {isAdmin && (
          <MenuItem onClick={handleVisualizarComo} sx={menuItemSx}>
            <ListItemIcon><Visibility fontSize="small" sx={{ color: impersonating ? '#F59E0B' : undefined }} /></ListItemIcon>
            <Box>
              <Typography variant="body2" sx={{ fontSize: 13 }}>{impersonating ? 'Parar Visualização' : 'Visualizar Como'}</Typography>
              {impersonating && (
                <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                  {impersonating.nome}
                </Typography>
              )}
            </Box>
          </MenuItem>
        )}
        {isAdmin && <Divider />}

        {/* Regular items */}
        <MenuItem onClick={() => handleNav('/sitemap')} sx={menuItemSx}>
          <ListItemIcon><Map fontSize="small" /></ListItemIcon>
          Mapa do App
        </MenuItem>
        <MenuItem onClick={() => handleNav('/perfil')} sx={menuItemSx}>
          <ListItemIcon><Person fontSize="small" /></ListItemIcon>
          Meu Perfil
        </MenuItem>
        <MenuItem onClick={toggleTheme} sx={menuItemSx}>
          <ListItemIcon>
            {isDark
              ? <LightMode fontSize="small" />
              : <DarkMode fontSize="small" />}
          </ListItemIcon>
          {isDark ? 'Tema Claro' : 'Tema Escuro'}
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); logout(); }} sx={menuItemSx}>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
    </>
  );
}
