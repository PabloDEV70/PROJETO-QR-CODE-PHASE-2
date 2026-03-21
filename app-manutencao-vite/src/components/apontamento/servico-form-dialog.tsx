import { useState, useEffect } from 'react';
import { TextField, FormControlLabel, Checkbox, Stack } from '@mui/material';
import { CrudFormDialog } from '@/components/shared/crud-form-dialog';
import { ProdutoCombobox } from '@/components/shared/produto-combobox';
import type { ServicoFormData, ServicoApontamento } from '@/types/apontamento-types';

const EMPTY: ServicoFormData = {
  descritivo: '',
  codprod: null,
  qtd: null,
  geraOs: false,
  hr: null,
  km: null,
  dtProgramacao: '',
};

interface ServicoFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ServicoFormData) => void;
  loading?: boolean;
  isProd?: boolean;
  editingItem?: ServicoApontamento | null;
}

export function ServicoFormDialog({
  open, onClose, onSubmit, loading = false, isProd = false,
  editingItem = null,
}: ServicoFormDialogProps) {
  const [form, setForm] = useState<ServicoFormData>(EMPTY);

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setForm({
          descritivo: editingItem.DESCRITIVO ?? '',
          codprod: editingItem.CODPROD,
          qtd: editingItem.QTD,
          geraOs: editingItem.GERAOS === 'S',
          hr: editingItem.HR,
          km: editingItem.KM,
          dtProgramacao: editingItem.DTPROGRAMACAO ?? '',
        });
      } else {
        setForm(EMPTY);
      }
    }
  }, [open, editingItem]);

  const set = (field: keyof ServicoFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <CrudFormDialog
      open={open}
      onClose={onClose}
      title={editingItem ? `Editar Servico #${editingItem.SEQ}` : 'Novo Servico'}
      onSubmit={() => onSubmit(form)}
      loading={loading}
      isProd={isProd}
      maxWidth="xs"
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <ProdutoCombobox
          value={form.codprod}
          onChange={(codprod) => set('codprod', codprod)}
        />

        <TextField
          label="Descritivo" size="small" fullWidth multiline rows={2}
          value={form.descritivo}
          onChange={(e) => set('descritivo', e.target.value)}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            label="Qtd" size="small" fullWidth type="number"
            value={form.qtd ?? ''}
            onChange={(e) => set('qtd', e.target.value ? Number(e.target.value) : null)}
          />
          <TextField
            label="HR" size="small" fullWidth type="number"
            value={form.hr ?? ''}
            onChange={(e) => set('hr', e.target.value ? Number(e.target.value) : null)}
          />
          <TextField
            label="KM" size="small" fullWidth type="number"
            value={form.km ?? ''}
            onChange={(e) => set('km', e.target.value ? Number(e.target.value) : null)}
          />
        </Stack>

        <TextField
          label="Data Programacao" size="small" fullWidth type="date"
          value={form.dtProgramacao}
          onChange={(e) => set('dtProgramacao', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <FormControlLabel
          control={
            <Checkbox
              size="small" checked={form.geraOs}
              onChange={(e) => set('geraOs', e.target.checked)}
            />
          }
          label="Gera OS"
          sx={{ '& .MuiFormControlLabel-label': { fontSize: 13 } }}
        />
      </Stack>
    </CrudFormDialog>
  );
}
