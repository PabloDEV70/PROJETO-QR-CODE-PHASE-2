import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  alpha,
} from '@mui/material';
import { Logout, DarkMode, LightMode, MyLocation, GpsFixed } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { useMyRole } from '@/hooks/use-my-role';
import { useUserLocationSharing } from '@/hooks/use-gps-tracking';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

const GPS_PREF_KEY = 'gps-sharing-active';

export function PerfilPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const database = useAuthStore((s) => s.database);
  const setDatabase = useAuthStore((s) => s.setDatabase);
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { data: role } = useMyRole();
  const gps = useUserLocationSharing();

  const [gpsEnabled, setGpsEnabled] = useState(() => {
    return localStorage.getItem(GPS_PREF_KEY) === 'true';
  });

  useEffect(() => {
    if (gpsEnabled && !gps.isTracking) {
      gps.startTracking();
    }
    if (!gpsEnabled && gps.isTracking) {
      gps.stopTracking();
    }
  }, [gpsEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGpsToggle = (checked: boolean) => {
    setGpsEnabled(checked);
    localStorage.setItem(GPS_PREF_KEY, String(checked));
  };

  const handleLogout = () => {
    gps.stopTracking();
    localStorage.removeItem(GPS_PREF_KEY);
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <FuncionarioAvatar
          codparc={user?.codparc}
          nome={user?.nome}
          sx={{ width: 80, height: 80, fontSize: 32, mx: 'auto', mb: 1.5 }}
        />
        <Typography variant="h6" fontWeight={700}>
          {user?.nome ?? user?.username ?? 'Usuario'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {role?.cargo ?? ''} {role?.departamento ? `- ${role.departamento}` : ''}
        </Typography>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 1.5,
          border: '1px solid',
          borderColor: gpsEnabled
            ? (theme) => alpha(theme.palette.success.main, 0.3)
            : 'divider',
          bgcolor: gpsEnabled
            ? (theme) => alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.08 : 0.02)
            : 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          {gpsEnabled ? (
            <GpsFixed sx={{ fontSize: 20, color: 'success.main' }} />
          ) : (
            <MyLocation sx={{ fontSize: 20, color: 'text.secondary' }} />
          )}
          <Typography variant="subtitle2" fontWeight={700}>
            Localizacao GPS
          </Typography>
        </Stack>
        <FormControlLabel
          control={
            <Switch
              checked={gpsEnabled}
              onChange={(_, checked) => handleGpsToggle(checked)}
              color="success"
            />
          }
          label="Compartilhar minha localizacao"
          sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}
        />

        {gps.isTracking && gps.latitude && (
          <Paper
            variant="outlined"
            sx={{ p: 1, mt: 1, bgcolor: 'transparent' }}
          >
            <Typography
              variant="body2"
              sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
            >
              {gps.latitude.toFixed(6)}, {gps.longitude?.toFixed(6)}
              {gps.accuracy ? ` (~${Math.round(gps.accuracy)}m)` : ''}
            </Typography>
          </Paper>
        )}

        {gps.error && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {gps.error}
          </Typography>
        )}
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 1.5, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
          Banco de dados
        </Typography>
        <ToggleButtonGroup
          value={database}
          exclusive
          onChange={(_, v) => { if (v) setDatabase(v); }}
          fullWidth
          sx={{
            '& .MuiToggleButton-root': {
              minHeight: 44,
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'none',
            },
          }}
        >
          <ToggleButton value="PROD">PROD</ToggleButton>
          <ToggleButton value="TESTE">TESTE</ToggleButton>
          <ToggleButton value="TREINA">TREINA</ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2.5, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={700}>
            Tema
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {mode === 'dark' ? 'Escuro' : 'Claro'}
            </Typography>
            <IconButton onClick={toggleTheme} size="small">
              {mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      <Button
        variant="outlined"
        color="error"
        fullWidth
        startIcon={<Logout />}
        onClick={handleLogout}
        sx={{ minHeight: 48, fontWeight: 700, textTransform: 'none' }}
      >
        Sair
      </Button>

      <Typography
        variant="caption"
        display="block"
        color="text.disabled"
        sx={{ textAlign: 'center', mt: 3, fontSize: '0.65rem' }}
      >
        Corridas PWA v1.0.0
      </Typography>
    </Box>
  );
}

export default PerfilPage;
