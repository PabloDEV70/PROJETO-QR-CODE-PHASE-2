import { useState } from 'react';
import {
  Drawer, Box, Typography, Button, TextField, Alert,
  CircularProgress, Stepper, Step, StepLabel, IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useTotpSetup, useTotpVerifySetup } from '@/hooks/use-totp';
import { RecoveryCodesDisplay } from './recovery-codes-display';

interface TotpSetupDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function TotpSetupDrawer({ open, onClose }: TotpSetupDrawerProps) {
  const [step, setStep] = useState(0);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const setup = useTotpSetup();
  const verify = useTotpVerifySetup();

  const handleStart = async () => {
    setError('');
    try {
      await setup.mutateAsync();
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao configurar 2FA');
    }
  };

  const handleVerify = async () => {
    setError('');
    try {
      await verify.mutateAsync(code);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Codigo invalido');
      setCode('');
    }
  };

  const handleClose = () => {
    setStep(0);
    setCode('');
    setError('');
    setup.reset();
    verify.reset();
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={handleClose}>
      <Box sx={{ width: 380, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>Seguranca 2FA</Typography>
          <IconButton onClick={handleClose}><Close /></IconButton>
        </Box>

        <Stepper activeStep={step} sx={{ mb: 3 }}>
          <Step><StepLabel>Ativar</StepLabel></Step>
          <Step><StepLabel>Verificar</StepLabel></Step>
          <Step><StepLabel>Salvar</StepLabel></Step>
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {step === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Proteja sua conta com autenticacao de dois fatores usando Google Authenticator
              ou outro app compativel.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={handleStart}
              disabled={setup.isPending}
            >
              {setup.isPending ? <CircularProgress size={24} /> : 'Ativar 2FA'}
            </Button>
          </Box>
        )}

        {step === 1 && setup.data && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Escaneie o QR code com seu app autenticador e insira o codigo gerado.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <QRCodeSVG value={setup.data.uri} size={200} />
            </Box>
            <TextField
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              fullWidth
              slotProps={{
                htmlInput: {
                  maxLength: 6,
                  style: { textAlign: 'center', fontSize: '1.3rem', letterSpacing: '0.4em' },
                  inputMode: 'numeric',
                },
              }}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleVerify}
              disabled={code.length !== 6 || verify.isPending}
            >
              {verify.isPending ? <CircularProgress size={24} /> : 'Verificar codigo'}
            </Button>
          </Box>
        )}

        {step === 2 && setup.data && (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              2FA ativado com sucesso!
            </Alert>
            <RecoveryCodesDisplay codes={setup.data.recoveryCodes} />
            <Button variant="contained" fullWidth onClick={handleClose} sx={{ mt: 2 }}>
              Concluir
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
