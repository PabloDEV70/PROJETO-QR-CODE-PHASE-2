import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import {
  Person,
  Logout,
  Map,
  DarkMode,
  LightMode,
  Circle,
  Check,
  Menu as MenuIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { PageSearch } from '@/components/layout/page-search';
import type { DatabaseEnv } from '@/types/auth-types';

const DB_COLORS: Record<DatabaseEnv, string> = {
  PROD: '#2e7d32',
  TESTE: '#ed6c02',
  TREINA: '#7b1fa2',
};
const DB_LABELS: Record<DatabaseEnv, string> = {
  PROD: 'Producao',
  TESTE: 'Teste',
  TREINA: 'Treinamento',
};
const DB_ORDER: DatabaseEnv[] = ['PROD', 'TESTE', 'TREINA'];

export function AppHeader() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const database = useAuthStore((s) => s.database);
  const setDatabase = useAuthStore((s) => s.setDatabase);
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
  const [dbAnchor, setDbAnchor] = useState<null | HTMLElement>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleLogout = () => {
    setUserAnchor(null);
    logout();
    navigate('/login');
  };

  const handleDatabaseChange = (db: DatabaseEnv) => {
    setDatabase(db);
    setDbAnchor(null);
  };

  const color = DB_COLORS[database];

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: { xs: 0.5, sm: 1.5 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
          {/* Logo / App name */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              display: { xs: 'none', sm: 'block' },
            }}
            onClick={() => navigate('/')}
          >
            TI Admin
          </Typography>

          {/* Mobile menu */}
          <IconButton
            size="small"
            sx={{ display: { xs: 'inline-flex', sm: 'none' }, mr: 0.5 }}
            onClick={() => navigate('/')}
          >
            <MenuIcon />
          </IconButton>

          {/* Spacer (xs only) */}
          <Box sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }} />

          {/* Page search - center */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              flex: 1,
              justifyContent: 'center',
              mx: { sm: 2, md: 4 },
            }}
          >
            <PageSearch />
          </Box>

          {/* Mobile search toggle */}
          <IconButton
            onClick={() => setMobileSearchOpen((v) => !v)}
            size="small"
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>

          {/* Right actions */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip
              label={database}
              size="small"
              onClick={(e) => setDbAnchor(e.currentTarget)}
              sx={{
                bgcolor: `${color}18`,
                color,
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                border: `1.5px solid ${color}50`,
                cursor: 'pointer',
                '&:hover': { bgcolor: `${color}28` },
              }}
            />
            <Menu
              anchorEl={dbAnchor}
              open={Boolean(dbAnchor)}
              onClose={() => setDbAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { sx: { minWidth: 180, mt: 0.5 } } }}
            >
              {DB_ORDER.map((db) => {
                const c = DB_COLORS[db];
                const selected = database === db;
                return (
                  <MenuItem
                    key={db}
                    selected={selected}
                    onClick={() => handleDatabaseChange(db)}
                    sx={{
                      py: 1, gap: 1.5,
                      ...(selected && {
                        bgcolor: `${c}12`,
                        '&.Mui-selected': { bgcolor: `${c}12` },
                        '&.Mui-selected:hover': { bgcolor: `${c}20` },
                      }),
                    }}
                  >
                    {selected
                      ? <Check sx={{ fontSize: 16, color: c }} />
                      : <Circle sx={{ fontSize: 8, color: c, opacity: 0.6, mx: 0.5 }} />}
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: selected ? 700 : 500, color: c, fontSize: '0.8rem', letterSpacing: '0.04em' }}
                      >
                        {db}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                        {DB_LABELS[db]}
                      </Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </Menu>

            <IconButton onClick={toggleTheme} size="small">
              {mode === 'dark'
                ? <LightMode sx={{ fontSize: 20 }} />
                : <DarkMode sx={{ fontSize: 20 }} />}
            </IconButton>

            <IconButton onClick={(e) => setUserAnchor(e.currentTarget)} size="small">
              <FuncionarioAvatar
                codparc={user?.codparc}
                codfunc={user?.codfunc}
                nome={user?.nome}
                size="small"
              />
            </IconButton>
            <Menu
              anchorEl={userAnchor}
              open={Boolean(userAnchor)}
              onClose={() => setUserAnchor(null)}
              slotProps={{ paper: { sx: { width: 220, mt: 0.5 } } }}
            >
              <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FuncionarioAvatar
                  codparc={user?.codparc}
                  codfunc={user?.codfunc}
                  nome={user?.nome}
                  size="medium"
                />
                <Box>
                  <Typography variant="subtitle2">{user?.nome}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.nomecompleto || 'Sem email'}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setUserAnchor(null); navigate('/perfil'); }}>
                <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                <ListItemText>Perfil</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { setUserAnchor(null); navigate('/sitemap'); }}>
                <ListItemIcon><Map fontSize="small" /></ListItemIcon>
                <ListItemText>Mapa do App</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                <ListItemText>Sair</ListItemText>
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <Toolbar
            variant="dense"
            sx={{
              display: { xs: 'flex', sm: 'none' },
              justifyContent: 'center',
              pb: 1, px: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <PageSearch />
          </Toolbar>
        )}
      </AppBar>

      {/* Spacer for fixed AppBar */}
      <Toolbar />
      {mobileSearchOpen && (
        <Toolbar variant="dense" sx={{ display: { xs: 'block', sm: 'none' } }} />
      )}
    </>
  );
}
