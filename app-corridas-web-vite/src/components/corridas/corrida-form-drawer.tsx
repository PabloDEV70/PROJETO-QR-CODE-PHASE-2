import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Drawer, Box, Typography, IconButton, TextField, Button,
  Stack, Switch, FormControlLabel, ToggleButton, ToggleButtonGroup,
  Autocomplete, CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Close, Business, Place, Phone } from '@mui/icons-material';
import { parseISO } from 'date-fns';
import { useCorridaById, useCreateCorrida, useUpdateCorrida } from '@/hooks/use-corridas';
import { useAuthStore } from '@/stores/auth-store';
import { BUSCAR_LEVAR_LABELS } from '@/types/corrida';
import { buscarParceiros, getMotoristasDetalhado } from '@/api/corridas';
import { GooglePlacesAutocomplete } from './google-places-autocomplete';
import type { ParceiroBusca, MotoristaDetalhado } from '@/api/corridas';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { useQuery } from '@tanstack/react-query';

interface CorridaFormDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  corridaId: number | null;
  onClose: () => void;
}

export function CorridaFormDrawer({ open, mode, corridaId, onClose }: CorridaFormDrawerProps) {
  const user = useAuthStore((s) => s.user);
  const { data: corrida } = useCorridaById(mode === 'edit' ? corridaId : null);
  const createMut = useCreateCorrida();
  const updateMut = useUpdateCorrida();

  const { data: motoristas } = useQuery({
    queryKey: ['corridas', 'motoristas-detalhado'],
    queryFn: getMotoristasDetalhado,
    staleTime: 5 * 60_000,
  });

  // Parceiro autocomplete state
  const [parceiroOptions, setParceiroOptions] = useState<ParceiroBusca[]>([]);
  const [parceiroLoading, setParceiroLoading] = useState(false);
  const [parceiroInput, setParceiroInput] = useState('');
  const [parceiroSelected, setParceiroSelected] = useState<ParceiroBusca | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController>(undefined);

  // Form state
  const [buscarLevar, setBuscarLevar] = useState('0');
  const [passageiros, setPassageiros] = useState('');
  const [destino, setDestino] = useState('');
  const [obs, setObs] = useState('');
  const [dtAcionamento, setDtAcionamento] = useState<Date | null>(new Date());
  const [enviawpp, setEnviawpp] = useState(true);
  const [motorista, setMotorista] = useState<MotoristaDetalhado | null>(null);

  // Reset form on open/mode change
  useEffect(() => {
    if (!open) return;
    if (mode === 'create') {
      setBuscarLevar('0');
      setPassageiros('');
      setDestino('');
      setObs('');
      setDtAcionamento(new Date());
      setEnviawpp(true);
      setParceiroSelected(null);
      setParceiroInput('');
      // Default motorista = first (MAIRON)
      if (motoristas?.length) {
        setMotorista(motoristas[0] as MotoristaDetalhado);
      }
    }
  }, [open, mode, motoristas]);

  // Load corrida data in edit mode
  useEffect(() => {
    if (mode !== 'edit' || !corrida) return;
    setBuscarLevar(corrida.BUSCARLEVAR ?? '0');
    setPassageiros(corrida.PASSAGEIROSMERCADORIA ?? '');
    setDestino(corrida.DESTINO ?? '');
    setObs(corrida.OBS ?? '');
    setDtAcionamento(corrida.DT_ACIONAMENTO ? parseISO(corrida.DT_ACIONAMENTO) : null);
    setEnviawpp(corrida.ENVIAWPP !== 'N');
    if (corrida.NOMEPARC && corrida.CODPARC) {
      setParceiroSelected({ CODPARC: corrida.CODPARC, NOMEPARC: corrida.NOMEPARC, TELEFONE: corrida.TELEFONE_PARCEIRO, CEP: corrida.CEP_PARCEIRO, NUMEND: corrida.NUMEND_PARCEIRO, RUA: corrida.RUA_PARCEIRO, BAIRRO: corrida.BAIRRO_PARCEIRO, CIDADE: corrida.CIDADE_PARCEIRO, UF: corrida.UF_PARCEIRO });
      setParceiroInput(corrida.NOMEPARC);
    }
    if (corrida.USU_MOTORISTA && motoristas) {
      const m = motoristas.find((x: any) => x.CODUSU === corrida.USU_MOTORISTA);
      if (m) setMotorista(m as MotoristaDetalhado);
    }
  }, [mode, corrida, motoristas]);

  // Parceiro search
  const searchParceiro = useCallback((term: string) => {
    abortRef.current?.abort();
    if (term.length < 2) { setParceiroOptions(parceiroSelected ? [parceiroSelected] : []); setParceiroLoading(false); return; }
    const controller = new AbortController();
    abortRef.current = controller;
    setParceiroLoading(true);
    buscarParceiros(term)
      .then((data) => { if (!controller.signal.aborted) setParceiroOptions(data); })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setParceiroLoading(false); });
  }, [parceiroSelected]);

  const handleParceiroInputChange = useCallback((_: unknown, val: string, reason: string) => {
    setParceiroInput(val);
    if (reason !== 'input') return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchParceiro(val), 300);
  }, [searchParceiro]);

  const isPending = createMut.isPending || updateMut.isPending;

  async function handleSubmit() {
    if (!user?.codusu) return;

    const payload = {
      USU_SOLICITANTE: user.codusu,
      USU_MOTORISTA: motorista?.CODUSU ?? 375,
      CODPARC: parceiroSelected?.CODPARC ?? undefined,
      DESTINO: destino || undefined,
      BUSCARLEVAR: buscarLevar,
      PASSAGEIROSMERCADORIA: passageiros || undefined,
      OBS: obs || undefined,
      DT_ACIONAMENTO: dtAcionamento?.toISOString(),
      ENVIAWPP: enviawpp ? 'S' : 'N',
    };

    if (mode === 'create') {
      await createMut.mutateAsync(payload);
    } else if (corridaId) {
      const { USU_SOLICITANTE: _, ...updatePayload } = payload;
      await updateMut.mutateAsync({ id: corridaId, payload: updatePayload });
    }
    onClose();
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      slotProps={{ paper: { sx: { width: 520, maxWidth: '100vw' } } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {mode === 'create' ? 'Nova Corrida' : `Editar Corrida #${corridaId}`}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <FormControlLabel
          control={<Switch checked={enviawpp} onChange={(e) => setEnviawpp(e.target.checked)} size="small" />}
          label={<Typography variant="caption" sx={{ fontSize: '0.7rem' }}>WhatsApp</Typography>}
          sx={{ mr: 0 }}
        />
        <IconButton size="small" onClick={onClose}><Close sx={{ fontSize: 18 }} /></IconButton>
      </Stack>

      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2 }}>
        <Stack spacing={2.5}>

          {/* Tipo */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
              Tipo da Corrida
            </Typography>
            <ToggleButtonGroup
              value={buscarLevar}
              exclusive
              onChange={(_, v) => { if (v !== null) setBuscarLevar(v); }}
              fullWidth
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  textTransform: 'none', fontWeight: 600, py: 1,
                  '&.Mui-selected': { bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } },
                },
              }}
            >
              {Object.entries(BUSCAR_LEVAR_LABELS).map(([k, v]) => (
                <ToggleButton key={k} value={k}>{v}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Parceiro Autocomplete */}
          <Autocomplete
            value={parceiroSelected}
            inputValue={parceiroInput}
            onInputChange={handleParceiroInputChange}
            onChange={(_, opt) => setParceiroSelected(opt)}
            options={parceiroOptions}
            loading={parceiroLoading}
            fullWidth
            size="small"
            filterOptions={(x) => x}
            getOptionLabel={(opt) => `${opt.NOMEPARC} (${opt.CODPARC})`}
            getOptionKey={(opt) => opt.CODPARC}
            isOptionEqualToValue={(opt, val) => opt.CODPARC === val.CODPARC}
            noOptionsText={parceiroInput.length < 2 ? 'Digite para buscar parceiro...' : 'Nenhum parceiro encontrado'}
            loadingText="Buscando..."
            renderOption={({ key, ...props }, option) => (
              <li key={key} {...props}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', width: '100%', py: 0.25 }}>
                  <Business sx={{ fontSize: 20, color: 'primary.main', mt: 0.25, flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>{option.NOMEPARC}</Typography>
                    {(option.RUA || option.BAIRRO) && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Place sx={{ fontSize: 11, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.68rem' }}>
                          {[option.RUA, option.NUMEND, option.BAIRRO, option.CIDADE, option.UF].filter(Boolean).join(', ')}
                        </Typography>
                      </Stack>
                    )}
                    {option.TELEFONE && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Phone sx={{ fontSize: 11, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>{option.TELEFONE}</Typography>
                      </Stack>
                    )}
                  </Box>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Parceiro / Destino"
                placeholder="Buscar por nome..."
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {parceiroLoading ? <CircularProgress size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />

          {/* Destino com busca Google Maps */}
          <GooglePlacesAutocomplete
            value={destino}
            onChange={setDestino}
            label="Destino (busca Google Maps)"
            placeholder="Buscar endereco..."
          />

          {/* Mercadoria / Passageiros */}
          <TextField
            label="Passageiros / Mercadoria"
            value={passageiros}
            onChange={(e) => setPassageiros(e.target.value)}
            size="small"
            fullWidth
            multiline
            rows={2}
            placeholder="Ex: PD-294727, RETIRAR PEDIDO, peca X..."
          />

          {/* Obs */}
          <TextField
            label="Observacoes"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            size="small"
            fullWidth
            multiline
            rows={2}
          />

          {/* Data Acionamento */}
          <DateTimePicker
            label="Data/Hora Acionamento"
            value={dtAcionamento}
            onChange={(v) => setDtAcionamento(v)}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />

          {/* Motorista */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block', fontWeight: 600 }}>
              Motorista
            </Typography>
            <Stack spacing={0.75}>
              {motoristas?.map((m: any) => {
                const mot = m as MotoristaDetalhado;
                const isSelected = motorista?.CODUSU === mot.CODUSU;
                return (
                  <Box
                    key={mot.CODUSU}
                    onClick={() => setMotorista(mot)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      p: 1, borderRadius: 1, cursor: 'pointer',
                      border: '2px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'primary.main' : 'transparent',
                      color: isSelected ? '#fff' : 'text.primary',
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <FuncionarioAvatar codparc={mot.CODPARC} nome={mot.NOMEUSU} size="small" />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600}>{mot.NOMEUSU}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.68rem' }}>
                        {mot.TOTAL_CORRIDAS} corridas · {mot.ABERTAS} abertas · {mot.EM_ANDAMENTO} andamento
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>

        </Stack>
      </Box>

      {/* Footer */}
      <Stack direction="row" spacing={1} sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button variant="outlined" onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isPending}
          sx={{ textTransform: 'none', fontWeight: 600, minWidth: 120 }}
        >
          {isPending ? 'Salvando...' : mode === 'create' ? 'Solicitar Corrida' : 'Salvar'}
        </Button>
      </Stack>
    </Drawer>
  );
}
