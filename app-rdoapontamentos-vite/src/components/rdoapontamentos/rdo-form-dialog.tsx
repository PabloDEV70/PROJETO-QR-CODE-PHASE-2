import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { format } from 'date-fns';
import { CrudFormDialog } from '@/components/shared/crud-form-dialog';
import { FuncionarioCombobox } from '@/components/shared/funcionario-combobox';
import { useCreateRdo, useUpdateRdo, useWriteGuard } from '@/hooks/use-rdo-mutations';
import type { RdoCabecalho } from '@/types/rdo-types';

interface RdoFormDialogProps {
  open: boolean;
  onClose: () => void;
  editItem?: RdoCabecalho | null;
}

export function RdoFormDialog({ open, onClose, editItem = null }: RdoFormDialogProps) {
  const isEdit = editItem != null;
  const { blocked: isProd } = useWriteGuard();
  const createMut = useCreateRdo();
  const updateMut = useUpdateRdo();
  const loading = createMut.isPending || updateMut.isPending;

  const [codparc, setCodparc] = useState<number | null>(null);
  const [dtref, setDtref] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (!open) return;
    if (isEdit && editItem) {
      setCodparc(editItem.CODPARC);
      setDtref(editItem.DTREF?.split('T')[0] ?? format(new Date(), 'yyyy-MM-dd'));
    } else {
      setCodparc(null);
      setDtref(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [open, editItem, isEdit]);

  const valid = codparc != null && dtref.length > 0;

  const handleSubmit = () => {
    if (!valid || !codparc) return;
    if (isEdit && editItem) {
      updateMut.mutate(
        { codrdo: editItem.CODRDO, data: { CODPARC: codparc, DTREF: dtref } },
        { onSuccess: onClose },
      );
    } else {
      createMut.mutate(
        { CODPARC: codparc, DTREF: dtref },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <CrudFormDialog
      open={open}
      onClose={onClose}
      title={isEdit ? `Editar RDO #${editItem?.CODRDO}` : 'Novo RDO'}
      onSubmit={handleSubmit}
      loading={loading}
      isProd={isProd}
      submitLabel={isEdit ? 'Salvar' : 'Criar RDO'}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        <FuncionarioCombobox
          value={codparc}
          onChange={(v) => setCodparc(v)}
          required
          label="Funcionario"
          placeholder="Busque pelo nome..."
        />
        <TextField
          label="Data Referencia"
          type="date"
          size="small"
          required
          fullWidth
          value={dtref}
          onChange={(e) => setDtref(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>
    </CrudFormDialog>
  );
}
