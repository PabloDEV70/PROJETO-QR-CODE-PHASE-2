import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import { Person, Lock, Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { loginStandard, getMe } from '@/api/auth';
import { useAuthStore } from '@/stores/auth-store';

export function MinimalLogin() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginStandard({ username, password });
      const user = { token: data.token, refreshToken: data.refreshToken, type: data.type, username: data.username };
      try {
        const me = await getMe(data.token);
        Object.assign(user, { codusu: me.codusu, nome: me.nome, codgrupo: me.codgrupo });
      } catch { /* proceed */ }
      useAuthStore.getState().setUser(user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', bgcolor: 'background.default',
    }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 360, p: 4 }}>
        <Typography sx={{
          fontFamily: "'STOP', 'Arial Black', sans-serif",
          fontSize: '2rem', color: 'primary.main', mb: 0.5, textAlign: 'center',
        }}>
          GIGANTAO
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Painel de Veiculos
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="Usuario" fullWidth required autoFocus
          value={username} onChange={(e) => setUsername(e.target.value.toUpperCase())}
          sx={{ mb: 2, '& input': { textTransform: 'uppercase' } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment> } }}
        />
        <TextField
          label="Senha" fullWidth required
          type={showPassword ? 'text' : 'password'}
          value={password} onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small">{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>,
            },
          }}
        />
        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}
          sx={{ py: 1.5, fontWeight: 600 }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </Box>
    </Box>
  );
}
