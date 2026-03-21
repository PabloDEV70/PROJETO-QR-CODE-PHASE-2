import { useState, useEffect } from 'react';
import {
  TextField, Stack, Box, Typography, MenuItem,
} from '@mui/material';
import { CrudFormDialog } from '@/components/shared/crud-form-dialog';
import { VeiculoCombobox } from '@/components/shared/veiculo-combobox';
import {
  TIPO_SERVICO_MAP, STATUS_OS_LABELS,
  type ApontamentoFormData, type ApontamentoListItem,
} from '@/types/apontamento-types';

const EMPTY_FORM: ApontamentoFormData = {
  codveiculo: null,
  km: null,
  horimetro: null,
  tag: '',
  obs: '',
  borrcharia: '',
  eletrica: '',
  funilaria: '',
  mecanica: '',
  caldeiraria: '',
  osExterna: 'N',
  opExterno: '',
  dtProgramacao: '',
  statusOs: '',
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
          borrcharia: editingItem.BORRCHARIA ?? '',
          eletrica: editingItem.ELETRICA ?? '',
          funilaria: editingItem.FUNILARIA ?? '',
          mecanica: editingItem.MECANICA ?? '',
          caldeiraria: editingItem.CALDEIRARIA ?? '',
          osExterna: editingItem.OSEXTERNA ?? 'N',
          opExterno: editingItem.OPEXTERNO ?? '',
          dtProgramacao: editingItem.DTPROGRAMACAO ?? '',
          statusOs: editingItem.STATUSOS ?? '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, editingItem]);

  const set = (field: keyof ApontamentoFormData, value: unknown) => {
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

        <Stack direction="row" spacing={2}>
          <TextField
            label="TAG" size="small" fullWidth
            value={form.tag}
            onChange={(e) => set('tag', e.target.value)}
          />
          <TextField
            label="Status OS" size="small" fullWidth select
            value={form.statusOs}
            onChange={(e) => set('statusOs', e.target.value)}
          >
            <MenuItem value="">Nenhum</MenuItem>
            {Object.entries(STATUS_OS_LABELS).map(([val, label]) => (
              <MenuItem key={val} value={val}>{label}</MenuItem>
            ))}
          </TextField>
        </Stack>

        <Stack direction="row" spacing={2}>
          <TextField
            label="KM" size="small" fullWidth type="number"
            value={form.km ?? ''}
            onChange={(e) => set('km', e.target.value ? Number(e.target.value) : null)}
          />
          <TextField
            label="Horimetro" size="small" fullWidth type="number"
            value={form.horimetro ?? ''}
            onChange={(e) => set('horimetro', e.target.value ? Number(e.target.value) : null)}
          />
        </Stack>

        {/* Tipos de Servico com subcategorias */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Tipos de Servico</Typography>
          <Stack spacing={1.5}>
            {Object.entries(TIPO_SERVICO_MAP).map(([key, { label, options }]) => (
              <TextField
                key={key}
                label={label}
                size="small"
                fullWidth
                select
                value={form[key.toLowerCase() as keyof ApontamentoFormData] || ''}
                onChange={(e) => set(key.toLowerCase() as keyof ApontamentoFormData, e.target.value)}
              >
                <MenuItem value="">Nenhum</MenuItem>
                {options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            ))}
          </Stack>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="OS Externa" size="small" select sx={{ minWidth: 120 }}
            value={form.osExterna}
            onChange={(e) => set('osExterna', e.target.value)}
          >
            <MenuItem value="N">Nao</MenuItem>
            <MenuItem value="S">Sim</MenuItem>
          </TextField>
          {form.osExterna === 'S' && (
            <TextField
              label="Operador Externo" size="small" fullWidth
              value={form.opExterno}
              onChange={(e) => set('opExterno', e.target.value)}
            />
          )}
        </Stack>

        <TextField
          label="Data Programacao" size="small" fullWidth
          type="date"
          value={form.dtProgramacao}
          onChange={(e) => set('dtProgramacao', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Observacoes" size="small" fullWidth multiline rows={3}
          value={form.obs}
          onChange={(e) => set('obs', e.target.value)}
        />
      </Stack>
    </CrudFormDialog>
  );
}
