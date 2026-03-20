import { Stack, TextField, MenuItem, IconButton, Tooltip } from '@mui/material';
import { FilterAltOff } from '@mui/icons-material';
import type { OsListParams } from '@/types/os-list-types';

interface OsFilterBarProps {
  filters: OsListParams;
  onChange: (updates: Partial<OsListParams>) => void;
  onClear: () => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'A', label: 'Aberta' },
  { value: 'E', label: 'Em Execucao' },
  { value: 'F', label: 'Finalizada' },
  { value: 'C', label: 'Cancelada' },
];

const TIPO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'I', label: 'Interna' },
  { value: 'E', label: 'Externa' },
];

const MANUTENCAO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'C', label: 'Corretiva' },
  { value: 'P', label: 'Preventiva' },
  { value: 'O', label: 'Outros' },
  { value: 'S', label: 'Socorro' },
  { value: 'R', label: 'Reforma' },
  { value: 'T', label: 'Retorno' },
];

export function OsFilterBar({ filters, onChange, onClear }: OsFilterBarProps) {
  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
      <TextField
        size="small"
        type="date"
        label="Inicio"
        value={filters.dataInicio || ''}
        sx={{ width: 160 }}
        slotProps={{ inputLabel: { shrink: true } }}
        onChange={(e) => onChange({ dataInicio: e.target.value || undefined })}
      />
      <TextField
        size="small"
        type="date"
        label="Fim"
        value={filters.dataFim || ''}
        sx={{ width: 160 }}
        slotProps={{ inputLabel: { shrink: true } }}
        onChange={(e) => onChange({ dataFim: e.target.value || undefined })}
      />
      <TextField
        size="small"
        select
        label="Status"
        value={filters.status || ''}
        sx={{ width: 140 }}
        onChange={(e) => onChange({ status: e.target.value || undefined })}
      >
        {STATUS_OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        select
        label="Tipo"
        value={filters.tipo || ''}
        sx={{ width: 130 }}
        onChange={(e) => onChange({ tipo: e.target.value || undefined })}
      >
        {TIPO_OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        select
        label="Manutencao"
        value={filters.manutencao || ''}
        sx={{ width: 150 }}
        onChange={(e) => onChange({ manutencao: e.target.value || undefined })}
      >
        {MANUTENCAO_OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        ))}
      </TextField>
      <Tooltip title="Limpar filtros">
        <IconButton size="small" onClick={onClear}>
          <FilterAltOff fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
