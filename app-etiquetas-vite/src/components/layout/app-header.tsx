import {
  AppBar, Toolbar, Typography, Chip, Box,
  Menu, MenuItem, IconButton, Stack,
} from '@mui/material';
import {
  DarkMode, LightMode, Storage, Circle, Check,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { UserMenu } from '@/components/layout/user-menu';
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
  const database = useAuthStore((s) => s.database);
  const setDatabase = useAuthStore((s) => s.setDatabase);
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [dbAnchor, setDbAnchor] = useState<null | HTMLElement>(null);

  const color = DB_COLORS[database];

  const handleDatabaseChange = (db: DatabaseEnv) => {
    setDatabase(db);
    setDbAnchor(null);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1.5 }}>
        <Typography
          sx={{
            fontFamily: "'STOP', 'Arial Black', sans-serif",
            fontSize: 18, letterSpacing: '0.06em', color: 'primary.main',
          }}
        >
          GIGANTAO
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>
          Etiquetas
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Chip
            icon={<Storage sx={{ fontSize: 14 }} />}
            label={database}
            size="small"
            onClick={(e) => setDbAnchor(e.currentTarget)}
            sx={{
              fontWeight: 700, fontSize: 11,
              bgcolor: `${color}14`,
              color,
              borderColor: `${color}40`,
              border: '1px solid',
              cursor: 'pointer',
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
                      sx={{ fontWeight: selected ? 700 : 500, color: c, fontSize: '0.8rem' }}
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
            {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
          </IconButton>

          <UserMenu />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
