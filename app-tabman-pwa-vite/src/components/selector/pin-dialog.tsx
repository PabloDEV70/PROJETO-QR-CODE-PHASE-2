import { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogContent, Typography, TextField, Avatar, alpha,
} from '@mui/material';
import { getFotoUrl } from '@/api/funcionarios';
interface PinTarget {
  codparc: number;
  nomeparc: string;
  cargo?: string | null;
}

interface PinDialogProps {
  open: boolean;
  colaborador: PinTarget | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function PinDialog({ open, colaborador, onConfirm, onClose }: PinDialogProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setPin('');
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleChange = (value: string) => {
    // Only digits
    const digits = value.replace(/\D/g, '');
    setPin(digits);
    setError(false);

    // Auto-validate when enough digits entered
    if (colaborador && digits.length >= String(colaborador.codparc).length) {
      if (digits === String(colaborador.codparc)) {
        onConfirm();
      } else {
        setError(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin) {
      if (colaborador && pin === String(colaborador.codparc)) {
        onConfirm();
      } else {
        setError(true);
      }
    }
    if (e.key === 'Escape') onClose();
  };

  if (!colaborador) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
    >
      <DialogContent sx={{ p: 4, textAlign: 'center' }}>
        <Avatar
          src={getFotoUrl(colaborador.codparc)}
          sx={{
            width: 80, height: 80, mx: 'auto', mb: 2,
            border: '3px solid',
            borderColor: error ? 'error.main' : 'primary.main',
          }}
        >
          {colaborador.nomeparc.charAt(0)}
        </Avatar>

        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.25 }}>
          {colaborador.nomeparc}
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mb: 3 }}>
          {colaborador.cargo ?? 'Colaborador'}
        </Typography>

        <Typography sx={{
          fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary',
          textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1,
        }}>
          Digite seu codigo para confirmar
        </Typography>

        <TextField
          inputRef={inputRef}
          value={pin}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          error={error}
          helperText={error ? 'Codigo incorreto' : ' '}
          placeholder="CODPARC"
          autoComplete="off"
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            style: {
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              fontFamily: '"JetBrains Mono", monospace',
              letterSpacing: '0.15em',
            },
          }}
          sx={{
            maxWidth: 200,
            mx: 'auto',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: (t) => error
                ? alpha(t.palette.error.main, 0.04)
                : alpha(t.palette.primary.main, 0.04),
            },
          }}
        />

        <Typography
          onClick={onClose}
          sx={{
            fontSize: '0.75rem', color: 'text.disabled', mt: 1.5,
            cursor: 'pointer', '&:hover': { color: 'text.secondary' },
          }}
        >
          Cancelar
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
