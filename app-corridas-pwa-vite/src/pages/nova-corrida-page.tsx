import { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, MenuItem, Stack,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useAuthStore } from '@/stores/auth-store';
import { useCreateCorrida } from '@/hooks/use-corridas';
import { BUSCAR_LEVAR_LABELS } from '@/types/corrida';

export function NovaCorridaPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const create = useCreateCorrida();

  const [buscarLevar, setBuscarLevar] = useState('0');
  const [passageiros, setPassageiros] = useState('');
  const [obs, setObs] = useState('');
  const [destino, setDestino] = useState('');
  const [dtAcionamento, setDtAcionamento] = useState<Date | null>(new Date());
  const [enviawpp, setEnviawpp] = useState('S');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.codusu) return;

    await create.mutateAsync({
      USU_SOLICITANTE: user.codusu,
      BUSCARLEVAR: buscarLevar,
      PASSAGEIROSMERCADORIA: passageiros || undefined,
      OBS: obs || undefined,
      DESTINO: destino || undefined,
      DT_ACIONAMENTO: dtAcionamento?.toISOString(),
      ENVIAWPP: enviawpp,
    });
    navigate('/corridas');
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          Nova Corrida
        </Typography>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              select
              label="Tipo"
              value={buscarLevar}
              onChange={(e) => setBuscarLevar(e.target.value)}
              required
              fullWidth
            >
              {Object.entries(BUSCAR_LEVAR_LABELS).map(([v, l]) => (
                <MenuItem key={v} value={v}>{l}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Passageiros / Mercadoria"
              value={passageiros}
              onChange={(e) => setPassageiros(e.target.value)}
              multiline
              rows={2}
              fullWidth
              placeholder="Ex: PD-294727, RETIRAR PEDIDO..."
            />

            <TextField
              label="Destino (opcional)"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              fullWidth
              placeholder="Endereco ou nome do local"
            />

            <TextField
              label="Observacoes"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />

            <DateTimePicker
              label="Data/Hora Acionamento"
              value={dtAcionamento}
              onChange={(v) => setDtAcionamento(v)}
              slotProps={{ textField: { fullWidth: true } }}
            />

            <TextField
              select
              label="Enviar no WhatsApp?"
              value={enviawpp}
              onChange={(e) => setEnviawpp(e.target.value)}
              fullWidth
            >
              <MenuItem value="S">Sim</MenuItem>
              <MenuItem value="N">Nao</MenuItem>
            </TextField>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={create.isPending}
              fullWidth
            >
              {create.isPending ? 'Enviando...' : 'Solicitar Corrida'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
