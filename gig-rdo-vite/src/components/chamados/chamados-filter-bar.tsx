import { Stack, TextField, MenuItem, InputAdornment } from '@mui/material';
import type { ChamadosListParams } from '@/types/chamados-types';

interface ChamadosFilterBarProps {
  filters: ChamadosListParams;
  onChange: (filters: ChamadosListParams) => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os Status' },
  { value: 'P', label: 'Pendente' },
  { value: 'E', label: 'Em Atendimento' },
  { value: 'S', label: 'Suspenso' },
  { value: 'A', label: 'Em Aprovacao' },
  { value: 'F', label: 'Finalizado' },
  { value: 'C', label: 'Cancelado' },
];

const PRIORIDADE_OPTIONS = [
  { value: '', label: 'Todas as Prioridades' },
  { value: 'A', label: 'Alta' },
  { value: 'M', label: 'Media' },
  { value: 'B', label: 'Baixa' },
];

export function ChamadosFilterBar({ filters, onChange }: ChamadosFilterBarProps) {
  function update(patch: Partial<ChamadosListParams>) {
    onChange({ ...filters, ...patch });
  }

  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mb: 2 }}>
      <TextField
        select
        size="small"
        label="Status"
        value={filters.status ?? ''}
        onChange={(e) => update({ status: e.target.value || undefined })}
        sx={{ minWidth: 160 }}
      >
        {STATUS_OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Prioridade"
        value={filters.prioridade ?? ''}
        onChange={(e) => update({ prioridade: e.target.value || undefined })}
        sx={{ minWidth: 160 }}
      >
        {PRIORIDADE_OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        ))}
      </TextField>

      <TextField
        size="small"
        label="Tipo de Chamado"
        value={filters.tipoChamado ?? ''}
        onChange={(e) => update({ tipoChamado: e.target.value || undefined })}
        sx={{ minWidth: 180 }}
      />

      <TextField
        size="small"
        label="Data Inicio"
        type="date"
        value={filters.dataInicio ?? ''}
        onChange={(e) => update({ dataInicio: e.target.value || undefined })}
        InputLabelProps={{ shrink: true }}
        InputProps={{ startAdornment: <InputAdornment position="start" /> }}
        sx={{ minWidth: 160 }}
      />

      <TextField
        size="small"
        label="Data Fim"
        type="date"
        value={filters.dataFim ?? ''}
        onChange={(e) => update({ dataFim: e.target.value || undefined })}
        InputLabelProps={{ shrink: true }}
        InputProps={{ startAdornment: <InputAdornment position="start" /> }}
        sx={{ minWidth: 160 }}
      />
    </Stack>
  );
}
