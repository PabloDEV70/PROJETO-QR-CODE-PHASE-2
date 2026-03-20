import { useState, useEffect } from 'react';
import {
  TextField, FormControlLabel, Checkbox, Stack, Box, Typography,
} from '@mui/material';
import { CrudFormDialog } from '@/components/shared/crud-form-dialog';
import { VeiculoCombobox } from '@/components/shared/veiculo-combobox';
import type { ApontamentoFormData, ApontamentoListItem } from '@/types/apontamento-types';

const EMPTY_FORM: ApontamentoFormData = {
  codveiculo: null,
  km: null,
  horimetro: null,
  tag: '',
  obs: '',
  borrcharia: false,
  eletrica: false,
  funilaria: false,
  mecanica: false,
  caldeiraria: false,
  osExterna: false,
  opExterno: '',
  dtProgramacao: '',
};

interface ApontamentoFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ApontamentoFormData) => void;
  loading?: boolean;
  isProd?: boolean;
  editingItem?: ApontamentoListItem | null;
}

export function ApontamentoFormDialog({
  open, onClose, onSubmit, loading = false, isProd = false,
  editingItem = null,
}: ApontamentoFormDialogProps) {
  const [form, setForm] = useState<ApontamentoFormData>(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setForm({
          codveiculo: editingItem.CODVEICULO,
          km: editingItem.KM,
          horimetro: editingItem.HORIMETRO,
          tag: editingItem.TAG ?? '',
          obs: editingItem.OBS ?? '',
          borrcharia: editingItem.BORRCHARIA === 'S',
          eletrica: editingItem.ELETRICA === 'S',
          funilaria: editingItem.FUNILARIA === 'S',
          mecanica: editingItem.MECANICA === 'S',
          caldeiraria: editingItem.CALDEIRARIA === 'S',
          osExterna: editingItem.OSEXTERNA === 'S',
          opExterno: editingItem.OPEXTERNO ?? '',
          dtProgramacao: editingItem.DTPROGRAMACAO ?? '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, editingItem]);

  const handleChange = (field: keyof ApontamentoFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVeiculoChange = (codveiculo: number | null, veiculo?: { adTag: string | null } | null) => {
    setForm((prev) => ({
      ...prev,
      codveiculo,
      tag: veiculo?.adTag ?? prev.tag,
    }));
  };

  return (
    <CrudFormDialog
      open={open}
      onClose={onClose}
      title={editingItem ? `Editar Apontamento #${editingItem.CODIGO}` : 'Novo Apontamento'}
      onSubmit={() => onSubmit(form)}
      loading={loading}
      isProd={isProd}
      maxWidth="sm"
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <VeiculoCombobox
          value={form.codveiculo}
          onChange={handleVeiculoChange}
          required
        />

        <TextField
          label="TAG" size="small" fullWidth
          value={form.tag}
          onChange={(e) => handleChange('tag', e.target.value)}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            label="KM" size="small" fullWidth type="number"
            value={form.km ?? ''}
            onChange={(e) => handleChange('km', e.target.value ? Number(e.target.value) : null)}
          />
          <TextField
            label="Horimetro" size="small" fullWidth type="number"
            value={form.horimetro ?? ''}
            onChange={(e) => handleChange('horimetro', e.target.value ? Number(e.target.value) : null)}
          />
        </Stack>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Tipo de Servico</Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0 }}>
            {(['borrcharia', 'eletrica', 'funilaria', 'mecanica', 'caldeiraria'] as const).map((f) => (
              <FormControlLabel
                key={f}
                control={
                  <Checkbox
                    size="small"
                    checked={form[f]}
                    onChange={(e) => handleChange(f, e.target.checked)}
                  />
                }
                label={f.charAt(0).toUpperCase() + f.slice(1)}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: 13 } }}
              />
            ))}
          </Stack>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={form.osExterna}
                onChange={(e) => handleChange('osExterna', e.target.checked)}
              />
            }
            label="OS Externa"
            sx={{ '& .MuiFormControlLabel-label': { fontSize: 13 } }}
          />
          {form.osExterna && (
            <TextField
              label="Operador Externo" size="small" fullWidth
              value={form.opExterno}
              onChange={(e) => handleChange('opExterno', e.target.value)}
            />
          )}
        </Stack>

        <TextField
          label="Data Programacao" size="small" fullWidth
          type="date"
          value={form.dtProgramacao}
          onChange={(e) => handleChange('dtProgramacao', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Observacoes" size="small" fullWidth multiline rows={3}
          value={form.obs}
          onChange={(e) => handleChange('obs', e.target.value)}
        />
      </Stack>
    </CrudFormDialog>
  );
}
