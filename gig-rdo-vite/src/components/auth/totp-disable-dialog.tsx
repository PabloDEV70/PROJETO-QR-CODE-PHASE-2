import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, CircularProgress, Box,
} from '@mui/material';
import { useTotpDisable } from '@/hooks/use-totp';

interface TotpDisableDialogProps {
  open: boolean;
  onClose: () => void;
}

export function TotpDisableDialog({ open, onClose }: TotpDisableDialogProps) {
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const disable = useTotpDisable();

  const handleDisable = async () => {
    setError('');
    try {
      await disable.mutateAsync({ password, code });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desativar 2FA');
    }
  };

  const handleClose = () => {
    setPassword('');
    setCode('');
    setError('');
    disable.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Desativar 2FA</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="Codigo TOTP"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 6, inputMode: 'numeric' } }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDisable}
          disabled={!password || code.length !== 6 || disable.isPending}
        >
          {disable.isPending ? <CircularProgress size={20} /> : 'Desativar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
