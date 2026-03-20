import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Button, Chip, IconButton, Stack, TextField, Typography, Alert,
  Autocomplete,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery } from '@tanstack/react-query';
import { getMotivosAtivos } from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';
import { useRdoDia } from '@/hooks/use-rdo-dia';
import { useAddDetalhe, useUpdateDetalhe, useDeleteDetalhe, useWriteGuard } from '@/hooks/use-rdo-mutations';
import { MotivoChip } from '@/components/apontamento/motivo-chip';
import { hhmmToString, stringToHhmm, duracaoMinutos, formatMinutos } from '@/utils/hora-utils';
import type { RdoMotivo } from '@/types/rdo-types';

export function AtividadeFormPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const codrdo = Number(sp.get('codrdo'));
  const editItemNum = sp.get('item') ? Number(sp.get('item')) : null;
  const isEdit = editItemNum != null;

  const { detalhes } = useRdoDia(codrdo);
  const editItem = isEdit ? detalhes.find((d) => d.ITEM === editItemNum) ?? null : null;

  const { blocked: isProd } = useWriteGuard();
  const addMut = useAddDetalhe();
  const updateMut = useUpdateDetalhe();
  const deleteMut = useDeleteDetalhe();
  const loading = addMut.isPending || updateMut.isPending;

  const { data: motivos = [] } = useQuery({
    queryKey: ['motivos-ativos'],
    queryFn: getMotivosAtivos,
    ...CACHE_TIMES.motivos,
  });

  const [hrini, setHrini] = useState('07:00');
  const [hrfim, setHrfim] = useState('08:00');
  const [motivo, setMotivo] = useState<RdoMotivo | null>(null);
  const [nuos, setNuos] = useState('');
  const [obs, setObs] = useState('');

  // Populate form on load
  useEffect(() => {
    if (isEdit && editItem) {
      setHrini(hhmmToString(editItem.HRINI));
      setHrfim(hhmmToString(editItem.HRFIM));
      setMotivo(motivos.find((m) => m.RDOMOTIVOCOD === editItem.RDOMOTIVOCOD) ?? null);
      setNuos(editItem.NUOS != null ? String(editItem.NUOS) : '');
      setObs(editItem.OBS ?? '');
    } else if (!isEdit) {
      // New: auto-fill start time from last activity
      const sorted = [...detalhes].sort((a, b) => (a.HRINI ?? 0) - (b.HRINI ?? 0));
      const last = sorted[sorted.length - 1];
      const ini = last?.HRFIM ?? 700;
      setHrini(hhmmToString(ini));
      setHrfim(hhmmToString(ini + 100));
    }
  }, [isEdit, editItem, detalhes, motivos]);

  const duracao = useMemo(
    () => duracaoMinutos(stringToHhmm(hrini), stringToHhmm(hrfim)),
    [hrini, hrfim],
  );

  const valid = hrini && hrfim && motivo != null && duracao > 0;

  const goBack = () => navigate('/', { replace: true });

  const handleSubmit = () => {
    if (!valid || !motivo) return;
    const data = {
      HRINI: stringToHhmm(hrini),
      HRFIM: stringToHhmm(hrfim),
      RDOMOTIVOCOD: motivo.RDOMOTIVOCOD,
      NUOS: nuos ? Number(nuos) : null,
      OBS: obs.trim() || null,
    };
    if (isEdit && editItemNum != null) {
      updateMut.mutate({ codrdo, item: editItemNum, data }, { onSuccess: goBack });
    } else {
      addMut.mutate({ codrdo, data }, { onSuccess: goBack });
    }
  };

  const handleDelete = () => {
    if (!editItemNum) return;
    deleteMut.mutate({ codrdo, item: editItemNum }, { onSuccess: goBack });
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
          {isEdit ? 'Editar Atividade' : 'Nova Atividade'}
        </Typography>
        {isEdit && (
          <IconButton
            onClick={handleDelete}
            disabled={isProd || deleteMut.isPending}
            color="error"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Stack>

      {isProd && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Escrita bloqueada no banco PROD. Selecione TESTE ou TREINA.
        </Alert>
      )}

      <Stack spacing={2.5}>
        {/* Time row */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            label="Inicio"
            type="time"
            size="small"
            required
            value={hrini}
            onChange={(e) => setHrini(e.target.value)}
            sx={{ flex: 1 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Fim"
            type="time"
            size="small"
            required
            value={hrfim}
            onChange={(e) => setHrfim(e.target.value)}
            sx={{ flex: 1 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Chip
            label={duracao > 0 ? formatMinutos(duracao) : 'Invalido'}
            color={duracao > 0 ? 'info' : 'error'}
            size="small"
            variant="outlined"
          />
        </Stack>

        {/* Motivo */}
        <Autocomplete
          value={motivo}
          onChange={(_, v) => setMotivo(v)}
          options={motivos}
          getOptionLabel={(o) => `${o.SIGLA} - ${o.DESCRICAO}`}
          isOptionEqualToValue={(a, b) => a.RDOMOTIVOCOD === b.RDOMOTIVOCOD}
          size="small"
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <Box component="li" key={key} {...rest} sx={{ display: 'flex', gap: 1 }}>
                <MotivoChip sigla={option.SIGLA} produtivo={option.PRODUTIVO} />
                {option.DESCRICAO}
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField {...params} label="Motivo" required placeholder="Selecione o motivo" />
          )}
        />

        {/* OS */}
        <TextField
          label="OS (opcional)"
          type="number"
          size="small"
          value={nuos}
          onChange={(e) => setNuos(e.target.value)}
        />

        {/* OBS */}
        <TextField
          label="Observacao (opcional)"
          size="small"
          multiline
          rows={2}
          value={obs}
          onChange={(e) => setObs(e.target.value)}
        />

        {/* Actions */}
        <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
          <Button variant="outlined" onClick={() => navigate(-1)} sx={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!valid || isProd || loading}
            sx={{ flex: 1 }}
          >
            {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default AtividadeFormPage;
