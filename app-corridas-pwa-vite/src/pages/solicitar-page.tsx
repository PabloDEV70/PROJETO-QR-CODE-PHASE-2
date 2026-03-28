import { useState } from 'react';
import {
  Box, Typography, TextField, Button, Stack, Paper, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { LocalShipping, CallReceived, SwapHoriz, Send } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useCreateCorrida } from '@/hooks/use-corridas';

export function SolicitarPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const create = useCreateCorrida();

  const [buscarLevar, setBuscarLevar] = useState<string>('0');
  const [destino, setDestino] = useState('');
  const [passageiros, setPassageiros] = useState('');
  const [obs, setObs] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.codusu) return;

    await create.mutateAsync({
      USU_SOLICITANTE: user.codusu,
      BUSCARLEVAR: buscarLevar,
      PASSAGEIROSMERCADORIA: passageiros || undefined,
      OBS: obs || undefined,
      DESTINO: destino || undefined,
      DT_ACIONAMENTO: new Date().toISOString(),
      ENVIAWPP: 'S',
    });
    navigate('/minhas');
  }

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Solicitar Corrida
      </Typography>

      <Paper sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Tipo
              </Typography>
              <ToggleButtonGroup
                value={buscarLevar}
                exclusive
                onChange={(_, v) => { if (v !== null) setBuscarLevar(v); }}
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    py: 1.5,
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: 'none',
                    gap: 0.5,
                    minHeight: 52,
                  },
                }}
              >
                <ToggleButton value="0">
                  <CallReceived fontSize="small" />
                  Buscar
                </ToggleButton>
                <ToggleButton value="1">
                  <LocalShipping fontSize="small" />
                  Levar
                </ToggleButton>
                <ToggleButton value="3">
                  <SwapHoriz fontSize="small" />
                  Levar e Buscar
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <TextField
              label="Parceiro / Destino"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              fullWidth
              placeholder="Nome do parceiro ou endereco"
            />

            <TextField
              label="Mercadoria / Passageiros"
              value={passageiros}
              onChange={(e) => setPassageiros(e.target.value)}
              multiline
              rows={2}
              fullWidth
              placeholder="Ex: PD-294727, RETIRAR PEDIDO..."
            />

            <TextField
              label="Observacoes"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<Send />}
              disabled={create.isPending}
              fullWidth
              sx={{ minHeight: 52, fontWeight: 700, fontSize: 16 }}
            >
              {create.isPending ? 'Enviando...' : 'Solicitar Corrida'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
