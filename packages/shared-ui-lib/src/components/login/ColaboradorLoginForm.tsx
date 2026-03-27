import type React from 'react';
import {
  Box, TextField, Button, Stack,
  InputAdornment, CircularProgress,
} from '@mui/material';
import { Login as LoginIcon, Badge, Fingerprint } from '@mui/icons-material';

interface ColaboradorFormProps {
  codparc: string;
  cpf: string;
  loading: boolean;
  onCodparcChange: (val: string) => void;
  onCpfChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  children?: React.ReactNode;
}

export function ColaboradorLoginForm({
  codparc, cpf, loading,
  onCodparcChange, onCpfChange, onSubmit,
  children,
}: ColaboradorFormProps) {
  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        <TextField
          label="Codigo do Parceiro" fullWidth required autoFocus
          type="number" value={codparc}
          onChange={(e) => onCodparcChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Badge sx={{ color: 'text.disabled', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label="CPF" fullWidth required
          value={cpf} onChange={(e) => onCpfChange(e.target.value)}
          placeholder="000.000.000-00"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Fingerprint sx={{ color: 'text.disabled', fontSize: 20 }} />
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
