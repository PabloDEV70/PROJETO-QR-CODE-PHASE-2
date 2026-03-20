import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Stack, Typography,
  CircularProgress, Select, MenuItem, FormControl,
  InputLabel, InputAdornment, IconButton,
} from '@mui/material';
import {
  Person, Lock, Visibility, VisibilityOff,
} from '@mui/icons-material';
import { loginSupervisor, getMe } from '@/api/auth';
import { useDeviceStore } from '@/stores/device-store';
import { useNotificationStore } from '@/stores/notification-store';
import type { DatabaseEnv } from '@/types/auth-types';

const DB_OPTIONS: { value: DatabaseEnv; label: string }[] = [
  { value: 'PROD', label: 'Producao' },
  { value: 'TESTE', label: 'Teste' },
  { value: 'TREINA', label: 'Treina' },
];

export function SetupLogin() {
  const navigate = useNavigate();
  const addToast = useNotificationStore((s) => s.addToast);
  const configure = useDeviceStore((s) => s.configure);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState<DatabaseEnv>('PROD');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoading(true);
    try {
      // Set database before login so the interceptor sends correct header
      useDeviceStore.setState({ database });

      const loginResult = await loginSupervisor(username.trim(), password);

      // Set token so getMe() can authenticate
      useDeviceStore.setState({ token: loginResult.token });

      const meResult = await getMe();
      configure(loginResult, meResult, database);
      navigate('/', { replace: true });
    } catch (err) {
      // Reset on failure
      useDeviceStore.setState({ token: null });
      const msg = err instanceof Error ? err.message : 'Erro ao autenticar';
      addToast('error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        px: 3,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Stack spacing={1} alignItems="center" sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontFamily: 'STOP, sans-serif',
              fontSize: '2.5rem',
              color: 'primary.main',
              letterSpacing: 4,
            }}
          >
            GIGANTAO
          </Typography>
          <Typography variant="h6" color="text.secondary">
            TabMan — Configuracao
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Usuario"
              fullWidth
              required
              autoFocus
              size="medium"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              sx={{ '& input': { textTransform: 'uppercase' } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Senha"
              fullWidth
              required
              size="medium"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                      >
                        {showPassword
                          ? <VisibilityOff fontSize="small" />
                          : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl fullWidth size="medium">
              <InputLabel>Base</InputLabel>
              <Select
                label="Base"
                value={database}
                onChange={(e) => setDatabase(e.target.value as DatabaseEnv)}
              >
                {DB_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ height: 56, fontWeight: 600, fontSize: '1rem' }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'CONFIGURAR TABLET'
              )}
            </Button>
          </Stack>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mt: 3 }}
        >
          Este tablet ficara logado como supervisor
          para apontamentos RDO.
        </Typography>
      </Box>
    </Box>
  );
}
