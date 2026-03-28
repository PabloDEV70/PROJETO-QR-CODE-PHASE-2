import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from '@mui/material';
import { Logout, DarkMode, LightMode } from '@mui/icons-material';
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
      <Stack alignItems="center" spacing={1} sx={{ mb: 3, mt: 1 }}>
        <FuncionarioAvatar
          codparc={user?.codparc}
          nome={user?.nome}
          sx={{ width: 80, height: 80, fontSize: 32 }}
        />
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>
          {user?.nome ?? user?.username ?? 'Usuario'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {role?.cargo ?? ''} {role?.departamento ? `- ${role.departamento}` : ''}
        </Typography>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Localizacao GPS
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={gpsEnabled}
              onChange={(_, checked) => handleGpsToggle(checked)}
              color="success"
            />
          }
          label="Compartilhar minha localizacao"
          sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
        />

        {gps.isTracking && gps.latitude && (
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ fontFamily: 'monospace', fontSize: '0.65rem', mt: 0.5 }}
          >
            {gps.latitude.toFixed(6)}, {gps.longitude?.toFixed(6)}
            {gps.accuracy ? ` (~${Math.round(gps.accuracy)}m)` : ''}
          </Typography>
        )}

        {gps.error && (
          <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
            {gps.error}
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
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
              fontSize: 12,
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

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={700}>
            Tema
          </Typography>
          <IconButton onClick={toggleTheme} size="small">
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {mode === 'dark' ? 'Escuro' : 'Claro'}
        </Typography>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Button
        variant="outlined"
        color="error"
        fullWidth
        startIcon={<Logout />}
        onClick={handleLogout}
        sx={{ minHeight: 48, fontWeight: 600 }}
      >
        Sair
      </Button>

      <Typography
        variant="caption"
        display="block"
        color="text.disabled"
        sx={{ textAlign: 'center', mt: 3, fontSize: '0.6rem' }}
      >
        Corridas PWA v1.0.0
      </Typography>
    </Box>
  );
}

export default PerfilPage;
