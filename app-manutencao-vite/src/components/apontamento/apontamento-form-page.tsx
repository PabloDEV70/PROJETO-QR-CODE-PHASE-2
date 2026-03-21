import { useState, useEffect } from 'react';
import {
  Box, TextField, Stack, Typography, MenuItem, Button,
  CircularProgress, Paper, Divider,
} from '@mui/material';
import { Save, Close } from '@mui/icons-material';
import { VeiculoCombobox } from '@/components/shared/veiculo-combobox';
import {
  TIPO_SERVICO_MAP, STATUS_OS_LABELS,
  type ApontamentoFormData, type ApontamentoListItem,
} from '@/types/apontamento-types';

const EMPTY_FORM: ApontamentoFormData = {
  codveiculo: null, km: null, horimetro: null,
  tag: '', obs: '',
  borrcharia: '', eletrica: '', funilaria: '', mecanica: '', caldeiraria: '',
  osExterna: 'N', opExterno: '', dtProgramacao: '', statusOs: '',
};

const fieldSx = {
  '& .MuiInputBase-root': { fontSize: 13, height: 34 },
  '& .MuiInputLabel-root': { fontSize: 12 },
  '& .MuiInputLabel-shrink': { fontSize: 13 },
};

const numFieldSx = {
  ...fieldSx,
  '& input': { textAlign: 'right' },
};

const dateFieldSx = {
  ...fieldSx,
  '& input': { textAlign: 'right' },
};

const multilineSx = {
  '& .MuiInputBase-root': { fontSize: 13 },
  '& .MuiInputLabel-root': { fontSize: 12 },
  '& .MuiInputLabel-shrink': { fontSize: 13 },
};

function SectionHeader({ label }: { label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Typography sx={{
        fontSize: 10, fontWeight: 800, color: 'text.disabled',
        textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap',
      }}>
        {label}
      </Typography>
      <Divider sx={{ flex: 1 }} />
    </Box>
  );
}

/** Convert datetime string to YYYY-MM-DD for date input */
function toDateInput(val: string | null | undefined): string {
  if (!val) return '';
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  // ISO datetime or other format
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

interface ApontamentoFormPageProps {
  onSubmit: (data: ApontamentoFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  editingItem?: ApontamentoListItem | null;
}

export function ApontamentoFormPage({
  onSubmit, onCancel, loading = false,
  editingItem = null,
}: ApontamentoFormPageProps) {
  const [form, setForm] = useState<ApontamentoFormData>(EMPTY_FORM);
  const isEditing = !!editingItem;

  useEffect(() => {
    if (editingItem) {
      setForm({
        codveiculo: editingItem.CODVEICULO,
        km: editingItem.KM, horimetro: editingItem.HORIMETRO,
        tag: editingItem.TAG ?? '', obs: editingItem.OBS ?? '',
        borrcharia: editingItem.BORRCHARIA ?? '',
        eletrica: editingItem.ELETRICA ?? '',
        funilaria: editingItem.FUNILARIA ?? '',
        mecanica: editingItem.MECANICA ?? '',
        caldeiraria: editingItem.CALDEIRARIA ?? '',
        osExterna: editingItem.OSEXTERNA ?? 'N',
        opExterno: editingItem.OPEXTERNO ?? '',
        dtProgramacao: toDateInput(editingItem.DTPROGRAMACAO),
        statusOs: editingItem.STATUSOS ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingItem]);

  const set = (field: keyof ApontamentoFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVeiculoChange = (codveiculo: number | null, veiculo?: { adTag: string | null } | null) => {
    setForm((prev) => ({ ...prev, codveiculo, tag: veiculo?.adTag ?? prev.tag }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* ── Header ── */}
      <Box sx={{
        flexShrink: 0, px: 2, py: 0.75,
        borderBottom: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex', alignItems: 'center', gap: 1,
      }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, flex: 1 }}>
          {isEditing ? `Editar #${editingItem.CODIGO}` : 'Novo Apontamento'}
        </Typography>
        <Button
          size="small" color="inherit"
          onClick={onCancel}
          sx={{ textTransform: 'none', fontSize: 11, minWidth: 0, px: 1 }}
        >
          <Close sx={{ fontSize: 16, mr: 0.25 }} /> Cancelar
        </Button>
        <Box sx={{ position: 'relative' }}>
          <Button
            variant="contained" color="success" size="small"
            onClick={() => onSubmit(form)}
            disabled={loading || !form.codveiculo}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11, minWidth: 0, px: 1.5 }}
          >
            <Save sx={{ fontSize: 16, mr: 0.5 }} /> Salvar
          </Button>
          {loading && (
            <CircularProgress size={18} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-9px', ml: '-9px' }} />
          )}
        </Box>
      </Box>

      {/* ── Form body — two columns, ERP style ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}>
          {/* ══ LEFT ══ */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: '6px' }}>
            <SectionHeader label="Veiculo" />
            <Stack spacing={1}>
              <VeiculoCombobox value={form.codveiculo} onChange={handleVeiculoChange} required />
              <Stack direction="row" spacing={1}>
                <TextField label="TAG" size="small" fullWidth value={form.tag} onChange={(e) => set('tag', e.target.value)} sx={fieldSx} />
                <TextField
                  label="Status" size="small" fullWidth select value={form.statusOs}
                  onChange={(e) => set('statusOs', e.target.value)} sx={fieldSx}
                >
                  <MenuItem value=""><em>Nenhum</em></MenuItem>
                  {Object.entries(STATUS_OS_LABELS).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
                </TextField>
              </Stack>
            </Stack>

            <SectionHeader label="Medicoes" />
            <Stack direction="row" spacing={1}>
              <TextField label="KM" size="small" fullWidth type="number" value={form.km ?? ''} onChange={(e) => set('km', e.target.value ? Number(e.target.value) : null)} sx={numFieldSx} />
              <TextField label="Horimetro" size="small" fullWidth type="number" value={form.horimetro ?? ''} onChange={(e) => set('horimetro', e.target.value ? Number(e.target.value) : null)} sx={numFieldSx} />
              <TextField label="Programacao" size="small" fullWidth type="date" value={form.dtProgramacao} onChange={(e) => set('dtProgramacao', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={dateFieldSx} />
            </Stack>

            <SectionHeader label="OS Externa" />
            <Stack direction="row" spacing={1}>
              <TextField label="Ext." size="small" select value={form.osExterna} onChange={(e) => set('osExterna', e.target.value)} sx={{ ...fieldSx, width: 90, flexShrink: 0 }}>
                <MenuItem value="N">Nao</MenuItem>
                <MenuItem value="S">Sim</MenuItem>
              </TextField>
              {form.osExterna === 'S' && (
                <TextField label="Operador Externo" size="small" fullWidth value={form.opExterno} onChange={(e) => set('opExterno', e.target.value)} sx={fieldSx} />
              )}
            </Stack>

            <SectionHeader label="Observacao" />
            <TextField
              size="small" fullWidth multiline rows={3}
              value={form.obs} onChange={(e) => set('obs', e.target.value)}
              placeholder="Observacoes..." sx={multilineSx}
            />
          </Paper>

          {/* ══ RIGHT ══ */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: '6px' }}>
            <SectionHeader label="Tipos de Servico" />
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
            }}>
              {Object.entries(TIPO_SERVICO_MAP).map(([key, { label, options }]) => (
                <TextField
                  key={key}
                  label={label}
                  size="small"
                  fullWidth
                  select
                  value={form[key.toLowerCase() as keyof ApontamentoFormData] || ''}
                  onChange={(e) => set(key.toLowerCase() as keyof ApontamentoFormData, e.target.value)}
                  sx={fieldSx}
                >
                  <MenuItem value=""><em>-</em></MenuItem>
                  {options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
