import { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, IconButton, Alert, Box, Chip,
  Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useQuery } from '@tanstack/react-query';
import { getMotivosAtivos } from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';
import { useAddDetalhe, useUpdateDetalhe, useWriteGuard } from '@/hooks/use-rdo-mutations';
import { MotivoChip } from '@/components/apontamento/motivo-chip';
import { hhmmToString, stringToHhmm, duracaoMinutos, formatMinutos } from '@/utils/hora-utils';
import { detalheFormSchema } from '@/schemas/rdo-schemas';
import { useFormValidation } from '@/hooks/use-form-validation';
import type { RdoDetalheItem, RdoMotivo } from '@/types/rdo-types';

interface DetalheFormDialogProps {
  open: boolean;
  onClose: () => void;
  codrdo: number;
  editItem?: RdoDetalheItem | null;
  lastHrfim?: number | null;
  onDelete?: (item: RdoDetalheItem) => void;
}

export function DetalheFormDialog({
  open, onClose, codrdo, editItem = null, lastHrfim = null, onDelete,
}: DetalheFormDialogProps) {
  const isEdit = editItem != null;
  const { blocked: isProd } = useWriteGuard();
  const addMut = useAddDetalhe();
  const updateMut = useUpdateDetalhe();
  const loading = addMut.isPending || updateMut.isPending;
  const { errors, validate, clearError, setErrors } = useFormValidation(detalheFormSchema);

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

  useEffect(() => {
    if (!open) return;
    if (isEdit && editItem) {
      setHrini(hhmmToString(editItem.HRINI));
      setHrfim(hhmmToString(editItem.HRFIM));
      setMotivo(motivos.find((m) => m.RDOMOTIVOCOD === editItem.RDOMOTIVOCOD) ?? null);
      setNuos(editItem.NUOS != null ? String(editItem.NUOS) : '');
      setObs(editItem.OBS ?? '');
    } else {
      const ini = lastHrfim ?? 700;
      setHrini(hhmmToString(ini));
      setHrfim(hhmmToString(ini + 100));
      setMotivo(null);
      setNuos('');
      setObs('');
    }
    setErrors({});
  }, [open, editItem, isEdit, lastHrfim, motivos, setErrors]);

  const duracao = useMemo(
    () => duracaoMinutos(stringToHhmm(hrini), stringToHhmm(hrfim)),
    [hrini, hrfim],
  );

  const handleSubmit = () => {
    const data = {
      HRINI: stringToHhmm(hrini),
      HRFIM: stringToHhmm(hrfim),
      RDOMOTIVOCOD: motivo?.RDOMOTIVOCOD ?? 0,
      NUOS: nuos ? Number(nuos) : null,
      OBS: obs.trim() || null,
    };
    if (!validate(data)) return;
    if (isEdit && editItem) {
      updateMut.mutate({ codrdo, item: editItem.ITEM, data }, { onSuccess: onClose });
    } else {
      addMut.mutate({ codrdo, data }, { onSuccess: onClose });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isEdit ? 'Editar Atividade' : 'Nova Atividade'}
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isProd && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Escrita bloqueada no banco PROD. Selecione TESTE ou TREINA.
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField label="Inicio" type="time" size="small" required
              value={hrini} onChange={(e) => { setHrini(e.target.value); clearError('HRINI'); }}
              error={!!errors.HRINI} helperText={errors.HRINI} sx={{ flex: 1 }} />
            <TextField label="Fim" type="time" size="small" required
              value={hrfim} onChange={(e) => { setHrfim(e.target.value); clearError('HRFIM'); }}
              error={!!errors.HRFIM} helperText={errors.HRFIM} sx={{ flex: 1 }} />
            <Chip
              label={duracao > 0 ? formatMinutos(duracao) : 'Invalido'}
              color={duracao > 0 ? 'info' : 'error'}
              size="small"
              variant="outlined"
            />
          </Box>
          <Autocomplete
            value={motivo}
            onChange={(_, v) => { setMotivo(v); clearError('RDOMOTIVOCOD'); }}
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
              <TextField {...params} label="Motivo" required placeholder="Selecione o motivo"
                error={!!errors.RDOMOTIVOCOD} helperText={errors.RDOMOTIVOCOD} />
            )}
          />
          <TextField label="OS (opcional)" type="number" size="small"
            value={nuos} onChange={(e) => setNuos(e.target.value)} />
          <TextField label="Observacao (opcional)" size="small" multiline rows={2}
            value={obs} onChange={(e) => setObs(e.target.value)} />
        </Box>
      </DialogContent>
      <DialogActions>
        {isEdit && editItem && onDelete && (
          <Button color="error" onClick={() => onDelete(editItem)} disabled={isProd}
            sx={{ mr: 'auto' }}>
            Excluir
          </Button>
        )}
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}
          disabled={isProd || loading}>
          {isEdit ? 'Salvar' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
