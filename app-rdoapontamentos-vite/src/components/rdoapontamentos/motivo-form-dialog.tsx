import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Switch, FormControlLabel, IconButton,
  Alert, Box, MenuItem, Chip, Stack, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CircleIcon from '@mui/icons-material/Circle';
import { motivoFormSchema } from '@/schemas/rdo-schemas';
import { useFormValidation } from '@/hooks/use-form-validation';
import type { RdoMotivo, RdoMotivoFormData } from '@/types/rdo-types';

const WT_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: '', label: '(nenhuma)', color: '#9e9e9e' },
  { value: 'wrenchTime', label: 'Wrench Time', color: '#1976d2' },
  { value: 'desloc', label: 'Deslocamento', color: '#0288d1' },
  { value: 'espera', label: 'Espera', color: '#ed6c02' },
  { value: 'buro', label: 'Burocracia', color: '#9c27b0' },
  { value: 'trein', label: 'Treinamento', color: '#2e7d32' },
  { value: 'pausas', label: 'Pausas', color: '#757575' },
  { value: 'externos', label: 'Externos', color: '#d32f2f' },
];

const WT_MAP = Object.fromEntries(WT_OPTIONS.map((o) => [o.value, o]));

interface MotivoFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RdoMotivoFormData) => void;
  loading?: boolean;
  initialData?: RdoMotivo | null;
  isProd: boolean;
}

export function MotivoFormDialog({
  open, onClose, onSubmit, loading, initialData, isProd,
}: MotivoFormDialogProps) {
  const isEdit = initialData != null;
  const { errors, validate, clearError, setErrors } = useFormValidation(motivoFormSchema);

  const [sigla, setSigla] = useState('');
  const [descricao, setDescricao] = useState('');
  const [produtivo, setProdutivo] = useState(true);
  const [ativo, setAtivo] = useState(true);
  const [tolerancia, setTolerancia] = useState('');
  const [penalidade, setPenalidade] = useState('');
  const [categoria, setCategoria] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setSigla(initialData.SIGLA);
      setDescricao(initialData.DESCRICAO);
      setProdutivo(initialData.PRODUTIVO === 'S');
      setAtivo(initialData.ATIVO === 'S');
      setTolerancia(initialData.TOLERANCIA != null ? String(initialData.TOLERANCIA) : '');
      setPenalidade(initialData.PENALIDADE != null ? String(initialData.PENALIDADE) : '');
      setCategoria(initialData.WTCATEGORIA || '');
    } else {
      setSigla(''); setDescricao(''); setProdutivo(true); setAtivo(true);
      setTolerancia(''); setPenalidade(''); setCategoria('');
    }
    setErrors({});
  }, [open, initialData, setErrors]);

  const handleSubmit = () => {
    const data: RdoMotivoFormData = {
      SIGLA: sigla.toUpperCase().trim(),
      DESCRICAO: descricao.trim(),
      PRODUTIVO: produtivo ? 'S' : 'N',
      ATIVO: ativo ? 'S' : 'N',
      TOLERANCIA: tolerancia ? Number(tolerancia) : null,
      PENALIDADE: penalidade ? Number(penalidade) : null,
      WTCATEGORIA: categoria || null,
    };
    if (!validate(data)) return;
    onSubmit(data);
  };

  const title = isEdit ? `Editar Motivo - ${initialData.SIGLA}` : 'Novo Motivo';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isProd && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Escrita bloqueada no banco PROD. Selecione TESTE ou TREINA.
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Sigla" size="small" required value={sigla}
            onChange={(e) => { setSigla(e.target.value); clearError('SIGLA'); }}
            inputProps={{ maxLength: 5 }}
            error={!!errors.SIGLA} helperText={errors.SIGLA || 'Max 5 caracteres'} />
          <TextField label="Descricao" size="small" required multiline rows={2}
            value={descricao} onChange={(e) => { setDescricao(e.target.value); clearError('DESCRICAO'); }}
            error={!!errors.DESCRICAO} helperText={errors.DESCRICAO} />
          <Box sx={{ display: 'flex', gap: 3 }}>
            <FormControlLabel
              control={<Switch checked={produtivo} onChange={(_, c) => setProdutivo(c)} color="success" />}
              label={
                <Chip label={produtivo ? 'Produtivo' : 'Improdutivo'} size="small"
                  color={produtivo ? 'success' : 'error'} variant="outlined"
                  sx={{ fontSize: 12, fontWeight: 600 }} />
              }
            />
            <FormControlLabel
              control={<Switch checked={ativo} onChange={(_, c) => setAtivo(c)} color="success" />}
              label={
                <Chip label={ativo ? 'Ativo' : 'Inativo'} size="small"
                  color={ativo ? 'success' : 'default'}
                  variant={ativo ? 'filled' : 'outlined'}
                  sx={{ fontSize: 12, fontWeight: 600, ...(ativo ? {} : { borderStyle: 'dashed' }) }} />
              }
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Tolerancia (min)" size="small" type="number"
              value={tolerancia} onChange={(e) => setTolerancia(e.target.value)} sx={{ flex: 1 }} />
            <TextField label="Penalidade (min)" size="small" type="number"
              value={penalidade} onChange={(e) => setPenalidade(e.target.value)} sx={{ flex: 1 }} />
          </Box>
          <TextField
            label="Categoria"
            size="small"
            select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            slotProps={{
              select: {
                renderValue: (val: unknown) => {
                  const opt = WT_MAP[val as string];
                  if (!opt || !opt.value) return <Typography color="text.secondary" fontSize={13}>(nenhuma)</Typography>;
                  return (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CircleIcon sx={{ fontSize: 12, color: opt.color }} />
                      <span>{opt.label}</span>
                    </Stack>
                  );
                },
              },
            }}
          >
            {WT_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircleIcon sx={{ fontSize: 12, color: o.color }} />
                  <Typography fontSize={13}>{o.label}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}
          disabled={isProd || loading}>
          {isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
