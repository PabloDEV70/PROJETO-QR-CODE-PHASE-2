import { useState, useRef, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Alert, Link, CircularProgress,
} from '@mui/material';
import type { LoginResponse } from '../../types/auth-types';

interface TotpVerifyFormProps {
  totpToken: string;
  onVerify: (totpToken: string, code: string) => Promise<LoginResponse>;
  onSuccess: (data: LoginResponse) => void;
  onCancel: () => void;
  onSwitchToRecovery: () => void;
}

export function TotpVerifyForm({
  totpToken, onVerify, onSuccess, onCancel, onSwitchToRecovery,
}: TotpVerifyFormProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      const data = await onVerify(totpToken, code);
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
        Verificacao em 2 etapas
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Insira o codigo de 6 digitos do seu app autenticador.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        inputRef={inputRef}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000" fullWidth
        slotProps={{
          htmlInput: {
            maxLength: 6,
            style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' },
            inputMode: 'numeric',
          },
        }}
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" fullWidth
        disabled={code.length !== 6 || loading} sx={{ mb: 2 }}>
        {loading ? <CircularProgress size={24} /> : 'Verificar'}
      </Button>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link component="button" type="button" variant="body2" onClick={onSwitchToRecovery}>
          Usar codigo de recuperacao
        </Link>
        <Link component="button" type="button" variant="body2" onClick={onCancel}>
          Voltar
        </Link>
      </Box>
    </Box>
  );
}
