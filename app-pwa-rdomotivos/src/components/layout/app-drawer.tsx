import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Drawer, Box, Typography, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Stack, alpha, IconButton,
} from '@mui/material';
import {
  Today, History, Build, Person, Settings, Logout,
  DarkMode, LightMode, Close, Groups, Visibility,
  PeopleAlt, Circle, Check, Inventory2,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { DatabaseEnv } from '@/types/auth-types';

const DB_META: Record<DatabaseEnv, { color: string; label: string }> = {
  PROD: { color: '#16a34a', label: 'PROD' },
  TESTE: { color: '#ea580c', label: 'TESTE' },
  TREINA: { color: '#7c3aed', label: 'TREINA' },
};
const DB_ORDER: DatabaseEnv[] = ['PROD', 'TESTE', 'TREINA'];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AppDrawer({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout, database, setDatabase, isAdmin, impersonating } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const queryClient = useQueryClient();
  const isDark = mode === 'dark';

  const displayName = user?.nome || user?.username || '?';
  const subtitle = [user?.pertencedp, user?.cargo].filter(Boolean).join(' · ') || user?.username || '';

  const go = (path: string) => { onClose(); navigate(path); };
  const handleDbChange = (db: DatabaseEnv) => { setDatabase(db); queryClient.invalidateQueries(); };

  const item = (label: string, icon: React.ReactNode, path: string, badge?: React.ReactNode) => {
    const selected = pathname === path || (path !== '/' && pathname.startsWith(path));
    return (
      <ListItemButton
        onClick={() => go(path)}
        selected={selected}
        sx={{
          borderRadius: 2, mx: 1, mb: 0.25,
          '&.Mui-selected': {
            bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
            '& .MuiListItemIcon-root': { color: 'primary.main' },
            '& .MuiListItemText-primary': { fontWeight: 700, color: 'primary.main' },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
        <ListItemText primary={label} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
        {badge}
      </ListItemButton>
    );
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280, bgcolor: 'background.default',
          borderRight: 'none',
          borderTopRightRadius: 16, borderBottomRightRadius: 16,
        },
      }}
    >
      {/* Header — user info */}
      <Box sx={{
        p: 2, pb: 1.5,
        background: isDark
          ? 'linear-gradient(180deg, #14532d 0%, #166534 100%)'
          : 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)',
        color: '#fff',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <FuncionarioAvatar
              codparc={user?.codparc}
              codemp={user?.codemp}
              codfunc={user?.codfunc}
              nome={displayName}
              size="medium"
              sx={{ border: `2px solid ${alpha('#fff', 0.4)}` }}
            />
            <Box>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>{displayName}</Typography>
              <Typography sx={{ fontSize: '0.7rem', opacity: 0.8 }}>{subtitle}</Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: alpha('#fff', 0.7) }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {/* DB selector */}
        <Stack direction="row" spacing={0.5} sx={{ mt: 1.5 }}>
          {DB_ORDER.map((db) => {
            const m = DB_META[db];
            const sel = database === db;
            return (
              <Box
                key={db}
                onClick={() => handleDbChange(db)}
                sx={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 0.4, py: 0.4, borderRadius: 1.5, cursor: 'pointer',
                  border: '1px solid', borderColor: sel ? alpha('#fff', 0.5) : alpha('#fff', 0.2),
                  bgcolor: sel ? alpha('#fff', 0.15) : 'transparent',
                  transition: 'all 150ms',
                }}
              >
                {sel ? <Check sx={{ fontSize: 10 }} /> : <Circle sx={{ fontSize: 5, color: m.color }} />}
                <Typography sx={{
                  fontSize: 9, fontWeight: sel ? 700 : 500,
                  fontFamily: 'monospace', letterSpacing: '0.04em',
                }}>
                  {db}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Nav items */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List disablePadding>
          {item('Hoje', <Today fontSize="small" />, '/')}
          {item('Historico', <History fontSize="small" />, '/meus-rdos')}
          {item('OS Manutencao', <Build fontSize="small" />, '/os-man')}
          {item('Produtos', <Inventory2 fontSize="small" />, '/produtos')}
          {item('Meu Perfil', <Person fontSize="small" />, '/perfil')}
        </List>

        {isAdmin && (
          <>
            <Divider sx={{ my: 1, mx: 2 }} />
            <Box sx={{ px: 2.5, mb: 0.5 }}>
              <Typography sx={{
                fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'text.disabled',
              }}>
                Admin
              </Typography>
            </Box>
            <List disablePadding>
              {item('Equipe Hoje', <Groups fontSize="small" />, '/admin/equipe')}
              {item('Quem faz o que', <PeopleAlt fontSize="small" />, '/admin/quem-faz')}
              {item(
                impersonating ? `Vendo: ${impersonating.nome.split(' ')[0]}` : 'Ver como...',
                <Visibility fontSize="small" sx={impersonating ? { color: '#F59E0B' } : {}} />,
                '/admin/ver-como',
                impersonating ? (
                  <Box sx={{
                    width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B',
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
                  }} />
                ) : undefined,
              )}
            </List>
          </>
        )}

        <Divider sx={{ my: 1, mx: 2 }} />
        <List disablePadding>
          {item('Configuracoes', <Settings fontSize="small" />, '/configuracoes')}
          <ListItemButton onClick={toggleTheme} sx={{ borderRadius: 2, mx: 1, mb: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </ListItemIcon>
            <ListItemText
              primary={isDark ? 'Tema Claro' : 'Tema Escuro'}
              primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
            />
          </ListItemButton>
        </List>
      </Box>

      {/* Footer — logout */}
      <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <ListItemButton
          onClick={() => { onClose(); logout(); }}
          sx={{ borderRadius: 2, color: '#EF4444' }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Logout fontSize="small" sx={{ color: '#EF4444' }} />
          </ListItemIcon>
          <ListItemText
            primary="Sair"
            primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 700 }}
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
