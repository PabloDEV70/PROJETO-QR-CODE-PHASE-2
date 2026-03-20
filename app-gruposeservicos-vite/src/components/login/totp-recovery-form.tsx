import { useState, useRef, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Alert, Link, CircularProgress,
} from '@mui/material';
import { recoverTotp } from '@/api/totp';
import type { LoginResponse } from '@/types/auth-types';

interface TotpRecoveryFormProps {
  totpToken: string;
  onSuccess: (data: LoginResponse) => void;
  onBack: () => void;
}

export function TotpRecoveryForm({ totpToken, onSuccess, onBack }: TotpRecoveryFormProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 8) return;
    setError('');
    setLoading(true);
    try {
      const data = await recoverTotp(totpToken, code);
      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Codigo invalido');
      setCode('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
        Codigo de recuperacao
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Insira um dos codigos de recuperacao fornecidos durante a configuracao do 2FA.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        inputRef={inputRef} value={code}
        onChange={(e) => setCode(e.target.value.trim().slice(0, 8))}
        placeholder="abcd1234" fullWidth
        slotProps={{
          htmlInput: { style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em' } },
        }}
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" fullWidth
        disabled={code.length < 8 || loading} sx={{ mb: 2 }}>
        {loading ? <CircularProgress size={24} /> : 'Recuperar acesso'}
      </Button>
      <Link component="button" type="button" variant="body2" onClick={onBack}>
        Voltar para codigo TOTP
      </Link>
    </Box>
  );
}
