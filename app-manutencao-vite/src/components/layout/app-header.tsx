import { useState } from 'react';
import {
  AppBar, Toolbar, Box, IconButton, Stack,
  Menu, MenuItem, Typography, Chip,
} from '@mui/material';
import {
  Brightness4, Brightness7,
  Menu as MenuIcon, Search as SearchIcon,
  Circle, Check,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { Logo } from '@/components/layout/logo';
import { DevIndicator } from '@/components/layout/dev-indicator';
import { ApiStatusIndicator } from '@/components/layout/api-status-indicator';
import { PageSearch } from '@/components/layout/page-search';
import { UserMenu } from '@/components/layout/user-menu';
import { MobileDrawer } from '@/components/layout/mobile-drawer';
import type { DatabaseEnv } from '@shared/ui-lib';

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
  const { mode, toggleTheme } = useThemeStore();
  const { database, setDatabase } = useAuthStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [dbMenuAnchor, setDbMenuAnchor] = useState<null | HTMLElement>(null);

  const handleDatabaseChange = (db: DatabaseEnv) => {
    setDatabase(db);
    setDbMenuAnchor(null);
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
        <Toolbar
          sx={{
            gap: { xs: 0.5, sm: 1.5 },
            px: { xs: 1.5, sm: 2, md: 3 },
          }}
        >
          {/* Hamburger - mobile only */}
          <IconButton
            onClick={() => setDrawerOpen(true)}
            size="small"
            sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>

          <Logo />
          <DevIndicator />

          {/* Spacer before search (xs only) */}
          <Box sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }} />

          {/* Page search - center stage, hidden on xs */}
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

          {/* Right-side actions */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ApiStatusIndicator />

            <Chip
              label={database}
              size="small"
              onClick={(e) => setDbMenuAnchor(e.currentTarget)}
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
              anchorEl={dbMenuAnchor}
              open={Boolean(dbMenuAnchor)}
              onClose={() => setDbMenuAnchor(null)}
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
                        sx={{
                          fontWeight: selected ? 700 : 500,
                          color: c,
                          fontSize: '0.8rem',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {db}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                      >
                        {DB_LABELS[db]}
                      </Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </Menu>

            {/* Theme toggle - md+ */}
            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{ display: { xs: 'none', md: 'inline-flex' } }}
            >
              {mode === 'dark'
                ? <Brightness7 sx={{ fontSize: 20 }} />
                : <Brightness4 sx={{ fontSize: 20 }} />}
            </IconButton>

            <UserMenu />
          </Stack>
        </Toolbar>

        {/* Mobile expandable search bar */}
        {mobileSearchOpen && (
          <Toolbar
            variant="dense"
            sx={{
              display: { xs: 'flex', sm: 'none' },
              justifyContent: 'center',
              pb: 1,
              px: 2,
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
        <Toolbar
          variant="dense"
          sx={{ display: { xs: 'block', sm: 'none' } }}
        />
      )}

      <MobileDrawer
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
