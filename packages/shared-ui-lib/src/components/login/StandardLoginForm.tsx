import type React from 'react';
import {
  Box, TextField, Button, Stack,
  InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import {
  Visibility, VisibilityOff, Login as LoginIcon,
  Person, Lock,
} from '@mui/icons-material';

interface StandardFormProps {
  username: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  onUsernameChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children?: React.ReactNode;
}

export function StandardLoginForm({
  username, password, showPassword, loading,
  onUsernameChange, onPasswordChange, onTogglePassword, onSubmit,
  children,
}: StandardFormProps) {
  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        <TextField
          label="Usuario" fullWidth required autoFocus
          value={username}
          onChange={(e) => onUsernameChange(e.target.value.toUpperCase())}
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
          label="Senha" fullWidth required
          type={showPassword ? 'text' : 'password'}
          value={password} onChange={(e) => onPasswordChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: 'text.disabled', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={onTogglePassword} edge="end" size="small">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        {children}
        <Button
          type="submit" variant="contained" size="large" fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}
          sx={{ py: 1.5, borderRadius: 2, fontWeight: 600, fontSize: '0.95rem' }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </Stack>
    </Box>
  );
}
