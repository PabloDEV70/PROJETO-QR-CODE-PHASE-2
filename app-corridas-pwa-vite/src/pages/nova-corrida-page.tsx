import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  CircularProgress,
  alpha,
} from '@mui/material';
import { CallReceived, LocalShipping, SwapHoriz, Send } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useCreateCorrida } from '@/hooks/use-corridas';
import { buscarParceiros } from '@/api/corridas';
import type { ParceiroBusca } from '@/types/corrida';

export function NovaCorridaPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const create = useCreateCorrida();

  const [buscarLevar, setBuscarLevar] = useState<string>('0');
  const [parceiro, setParceiro] = useState<ParceiroBusca | null>(null);
  const [parceiroInput, setParceiroInput] = useState('');
  const [parceiroOptions, setParceiroOptions] = useState<ParceiroBusca[]>([]);
  const [parceiroLoading, setParceiroLoading] = useState(false);
  const [destino, setDestino] = useState('');
  const [passageiros, setPassageiros] = useState('');
  const [obs, setObs] = useState('');

  const handleSearchParceiro = useCallback(async (term: string) => {
    if (term.length < 2) {
      setParceiroOptions([]);
      return;
    }
    setParceiroLoading(true);
    try {
      const results = await buscarParceiros(term);
      setParceiroOptions(results);
    } catch {
      setParceiroOptions([]);
    } finally {
      setParceiroLoading(false);
    }
  }, []);

  const debounceRef = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = useCallback(
    (_: unknown, value: string) => {
      setParceiroInput(value);
      if (debounceRef[0]) clearTimeout(debounceRef[0]);
      debounceRef[0] = setTimeout(() => handleSearchParceiro(value), 400);
    },
    [handleSearchParceiro, debounceRef],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.codusu) return;

    await create.mutateAsync({
      USU_SOLICITANTE: user.codusu,
      BUSCARLEVAR: buscarLevar,
      CODPARC: parceiro?.CODPARC ?? undefined,
      PASSAGEIROSMERCADORIA: passageiros || undefined,
      OBS: obs || undefined,
      DESTINO: destino || undefined,
      DT_ACIONAMENTO: new Date().toISOString(),
      ENVIAWPP: 'S',
    });
    navigate('/corridas');
  }

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Nova Corrida
      </Typography>

      <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                Tipo de corrida
              </Typography>
              <ToggleButtonGroup
                value={buscarLevar}
                exclusive
                onChange={(_, v) => { if (v !== null) setBuscarLevar(v); }}
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    py: 1.5,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    gap: 1,
                    minHeight: 52,
                    '&.Mui-selected': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      fontWeight: 700,
                    },
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

            <Autocomplete
              options={parceiroOptions}
              getOptionLabel={(opt) => opt.NOMEPARC}
              value={parceiro}
              onChange={(_, val) => setParceiro(val)}
              inputValue={parceiroInput}
              onInputChange={handleInputChange}
              loading={parceiroLoading}
              noOptionsText={parceiroInput.length < 2 ? 'Digite 2+ letras' : 'Nenhum parceiro'}
              renderOption={(props, opt) => (
                <li {...props} key={opt.CODPARC}>
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {opt.NOMEPARC}
                    </Typography>
                    {opt.ENDERECO && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {opt.ENDERECO}
                      </Typography>
                    )}
                    {opt.TELEFONE && (
                      <Typography variant="caption" color="text.disabled">
                        {opt.TELEFONE}
                      </Typography>
                    )}
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Parceiro"
                  placeholder="Buscar parceiro..."
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {parceiroLoading ? <CircularProgress size={18} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />

            <TextField
              label="Destino"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              fullWidth
              placeholder="Endereco ou referencia"
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
              startIcon={create.isPending ? <CircularProgress size={20} color="inherit" /> : <Send />}
              disabled={create.isPending}
              fullWidth
              sx={{ minHeight: 52, fontWeight: 700, fontSize: 16, textTransform: 'none' }}
            >
              {create.isPending ? 'Enviando...' : 'Solicitar Corrida'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

export default NovaCorridaPage;
