import { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Box, Typography, Autocomplete, Divider, Avatar, MenuItem, IconButton,
  Menu, ListItemIcon, ListItemText, TextField, InputAdornment, alpha, keyframes,
} from '@mui/material';
import {
  Circle, Search, Logout, Settings, KeyboardArrowDown, FiberManualRecord,
  ZoomIn, ZoomOut, RestartAlt, Map,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDeviceStore } from '@/stores/device-store';
import { getFotoUrl } from '@/api/funcionarios';
import type { DatabaseEnv } from '@/types/auth-types';

const DB_META: Record<DatabaseEnv, { color: string }> = {
  PROD: { color: '#4caf50' },
  TESTE: { color: '#ff9800' },
  TREINA: { color: '#9c27b0' },
};
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:0.4}`;

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1_000); return () => clearInterval(id); }, []);
  return now;
}

function useOnline() {
  const [o, setO] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setO(true); const off = () => setO(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return o;
}

interface AppHeaderProps {
  search?: string;
  onSearch?: (v: string) => void;
  showSearch?: boolean;
  breadcrumb?: string;
  departamentos?: string[];
}

export function AppHeader({ search, onSearch, showSearch = false, breadcrumb: _breadcrumb, departamentos = [] }: AppHeaderProps) {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const store = useDeviceStore();
  const now = useClock();
  const isOnline = useOnline();
  const [userMenu, setUserMenu] = useState<HTMLElement | null>(null);

  const currentScale = store.preferredScale || 100;
  const setScale = (val: number) => {
    const clamped = Math.max(70, Math.min(150, val));
    store.setPreferredScale(clamped);
    document.documentElement.style.fontSize = `${clamped}%`;
  };
  const changeScale = (delta: number) => setScale(currentScale + delta);

  useEffect(() => {
    document.documentElement.style.fontSize = `${currentScale}%`;
  }, []); // eslint-disable-line

  // Sync departamento: store → URL on mount
  const depFromUrl = sp.get('departamento') || null;
  useEffect(() => {
    if (!depFromUrl && store.preferredDepartamento && departamentos.includes(store.preferredDepartamento)) {
      const next = new URLSearchParams(sp);
      next.set('departamento', store.preferredDepartamento);
      setSp(next, { replace: true });
    }
  }, [store.preferredDepartamento, departamentos.length]); // eslint-disable-line

  const handleDepChange = (value: string | null) => {
    const next = new URLSearchParams(sp);
    if (value) next.set('departamento', value); else next.delete('departamento');
    setSp(next, { replace: true });
    store.setPreferredDepartamento(value);
  };

  const meta = DB_META[store.database];
  const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const handleLogout = () => { setUserMenu(null); store.reset(); navigate('/setup', { replace: true }); };

  return (
    <AppBar position="sticky" elevation={0} sx={{
      bgcolor: '#1b5e20', color: '#fff',
      boxShadow: '0 2px 16px rgba(0,0,0,0.3)', zIndex: 1200,
    }}>
      <Toolbar sx={{
        minHeight: { xs: '48px !important', sm: '52px !important' },
        height: { xs: 48, sm: 52 },
        px: { xs: 1, sm: 1.5, md: 2 },
        gap: 0,
      }}>

        {/* ═══ LEFT: Logo + Search ═══ */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, minWidth: 0 }}>
          {/* G + GIGANTAO — clickable */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.75,
              cursor: 'pointer', borderRadius: 1, px: 0.25,
              '&:hover': { bgcolor: alpha('#fff', 0.08) },
              transition: 'background 0.12s',
            }}
          >
            <Box sx={{
              width: 30, height: 30, borderRadius: '6px', bgcolor: alpha('#fff', 0.15),
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Typography sx={{ fontFamily: "'STOP', sans-serif", fontSize: 17, fontWeight: 900, lineHeight: 1 }}>G</Typography>
            </Box>
            <Typography sx={{
              fontFamily: "'STOP', sans-serif", fontSize: 13,
              fontWeight: 900, letterSpacing: '0.06em', lineHeight: 1,
              display: { xs: 'none', sm: 'block' },
            }}>
              GIGANTAO
            </Typography>
          </Box>

          {/* DB badge */}
          {store.database !== 'PROD' && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, px: 0.6, py: 0.15, borderRadius: 0.5, bgcolor: alpha('#fff', 0.12) }}>
              <Circle sx={{ fontSize: 6, color: meta.color, animation: `${pulse} 2s infinite` }} />
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, fontFamily: 'monospace' }}>{store.database}</Typography>
            </Box>
          )}

          {/* Search field */}
          {showSearch && onSearch && (
            <TextField
              value={search ?? ''}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Buscar nome ou codigo..."
              size="small"
              variant="standard"
              slotProps={{ input: {
                disableUnderline: true,
                startAdornment: <InputAdornment position="start"><Search sx={{ color: alpha('#fff', 0.4), fontSize: 18, ml: 0.75 }} /></InputAdornment>,
              }}}
              sx={{
                width: { xs: 160, sm: 220, md: 280 },
                bgcolor: alpha('#fff', 0.1), borderRadius: 1, height: 32,
                display: 'flex', justifyContent: 'center',
                '& input': { color: '#fff', fontSize: '0.82rem', fontWeight: 500, py: 0.4 },
                '& input::placeholder': { color: alpha('#fff', 0.35), opacity: 1 },
              }}
            />
          )}
        </Box>

        {/* ═══ CENTER: Clock (always centered) ═══ */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={{
            fontSize: { xs: '1.1rem', sm: '1.3rem' },
            fontWeight: 800, lineHeight: 1,
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.04em',
          }}>
            {hora}
          </Typography>
          <FiberManualRecord sx={{
            fontSize: 8, color: isOnline ? '#66bb6a' : '#ef5350',
            filter: isOnline ? 'drop-shadow(0 0 3px #66bb6a)' : 'none',
          }} />
        </Box>

        {/* ═══ RIGHT: Setor + User ═══ */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>

          {/* Departamento selector */}
          <Autocomplete
            size="small"
            disableClearable={!depFromUrl}
            sx={{
              width: { xs: 150, sm: 200, md: 260 },
              '& .MuiOutlinedInput-root': {
                height: 34, bgcolor: alpha('#fff', 0.12), borderRadius: 1.5,
                color: '#fff', fontSize: '0.85rem', fontWeight: 600,
                '& fieldset': { border: 'none' },
              },
              '& input::placeholder': { color: alpha('#fff', 0.5), opacity: 1, fontSize: '0.85rem' },
              '& .MuiAutocomplete-clearIndicator': {
                color: '#fff', opacity: 0.7, p: 0.25,
                '&:hover': { opacity: 1, bgcolor: alpha('#fff', 0.15) },
              },
              '& .MuiAutocomplete-popupIndicator': { color: alpha('#fff', 0.5), p: 0.25 },
            }}
            options={departamentos}
            value={depFromUrl}
            onChange={(_, v) => handleDepChange(v)}
            renderInput={(p) => <TextField {...p} placeholder="Todos os setores" />}
            clearOnEscape
          />

          {/* User nav */}
          <Box
            onClick={(e) => setUserMenu(e.currentTarget)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              cursor: 'pointer', pl: 0.5, pr: 0.5, py: 0.3, borderRadius: 1,
              bgcolor: alpha('#fff', 0.08),
              '&:hover': { bgcolor: alpha('#fff', 0.15) },
              transition: 'background 0.12s',
            }}
          >
            <Avatar
              src={store.supervisorCodparc ? getFotoUrl(store.supervisorCodparc) : undefined}
              sx={{
                width: 30, height: 30, fontSize: '0.7rem', fontWeight: 700,
                bgcolor: alpha('#fff', 0.2), border: `1.5px solid ${alpha('#fff', 0.3)}`,
              }}
            >
              {store.supervisorNome?.charAt(0) ?? 'S'}
            </Avatar>
            <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, lineHeight: 1.15, maxWidth: 100 }} noWrap>
                {store.supervisorNome ?? 'Supervisor'}
              </Typography>
            </Box>
            <KeyboardArrowDown sx={{ fontSize: 16, opacity: 0.4 }} />
          </Box>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={userMenu} open={!!userMenu} onClose={() => setUserMenu(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { minWidth: 220, mt: 0.5, borderRadius: 2 } } }}
          >
            <Box sx={{ px: 2, py: 1.25 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{store.supervisorNome}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>#{store.supervisorCodparc} · {store.database}</Typography>
            </Box>
            <Divider />
            <Box sx={{ px: 2, py: 0.75, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', mr: 'auto' }}>Escala</Typography>
              <IconButton size="small" onClick={() => changeScale(-10)} disabled={currentScale <= 70}>
                <ZoomOut sx={{ fontSize: 18 }} />
              </IconButton>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'monospace', minWidth: 38, textAlign: 'center' }}>
                {currentScale}%
              </Typography>
              <IconButton size="small" onClick={() => changeScale(10)} disabled={currentScale >= 150}>
                <ZoomIn sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton size="small" onClick={() => setScale(100)} disabled={currentScale === 100}>
                <RestartAlt sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
            <Divider />
            <MenuItem onClick={() => { setUserMenu(null); navigate('/sitemap'); }}>
              <ListItemIcon><Map fontSize="small" /></ListItemIcon>
              <ListItemText primary="Mapa do App" primaryTypographyProps={{ fontSize: '0.85rem' }} />
            </MenuItem>
            <MenuItem onClick={() => { setUserMenu(null); navigate('/configuracoes'); }}>
              <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
              <ListItemText primary="Configuracoes" primaryTypographyProps={{ fontSize: '0.85rem' }} />
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
              <ListItemText primary="Sair do tablet" primaryTypographyProps={{ fontSize: '0.85rem' }} />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
