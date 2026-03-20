import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, IconButton, Alert, Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import { useCreateRdo, useWriteGuard } from '@/hooks/use-rdo-mutations';
import { FuncionarioCombobox } from '@/components/shared/funcionario-combobox';
import { rdoFormSchema } from '@/schemas/rdo-schemas';
import { useFormValidation } from '@/hooks/use-form-validation';

interface RdoFormDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RdoFormDialog({ open, onClose }: RdoFormDialogProps) {
  const { blocked: isProd } = useWriteGuard();
  const createMut = useCreateRdo();
  const { errors, validate, clearError, setErrors } = useFormValidation(rdoFormSchema);

  const [codparc, setCodparc] = useState<number | null>(null);
  const [dtref, setDtref] = useState('');

  useEffect(() => {
    if (!open) return;
    setCodparc(null);
    setDtref(format(new Date(), 'yyyy-MM-dd'));
    setErrors({});
  }, [open, setErrors]);

  const handleSubmit = () => {
    const data = { CODPARC: codparc as number, DTREF: dtref };
    if (!validate(data)) return;
    createMut.mutate(data, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Novo RDO
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isProd && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Escrita bloqueada no banco PROD. Selecione TESTE ou TREINA.
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FuncionarioCombobox
            value={codparc}
            onChange={(val) => { setCodparc(val); clearError('CODPARC'); }}
            label="Funcionario"
            required
            error={!!errors.CODPARC}
            helperText={errors.CODPARC}
          />
          <TextField
            label="Data"
            type="date"
            size="small"
            required
            value={dtref}
            onChange={(e) => { setDtref(e.target.value); clearError('DTREF'); }}
            error={!!errors.DTREF}
            helperText={errors.DTREF}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}
          disabled={isProd || createMut.isPending}>
          Criar RDO
        </Button>
      </DialogActions>
    </Dialog>
  );
}
