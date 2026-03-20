import { useMemo } from 'react';
import {
  Paper, Stack, Button, Select, MenuItem, FormControl,
  CircularProgress, Chip, Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { parseISO, format, isValid } from 'date-fns';
import { FilterAltOff } from '@mui/icons-material';
import { getPeriodPresets, getActivePresetKey } from '@/utils/rdo-filter-helpers';

interface ChamadosToolbarProps {
  dataInicio: string;
  dataFim: string;
  status: string;
  prioridade: string;
  onUpdateParams: (updates: Record<string, string | null>) => void;
  onClearAll: () => void;
  totalRegistros?: number;
  isLoading?: boolean;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos Status' },
  { value: 'P', label: 'Pendente' },
  { value: 'E', label: 'Em Atendimento' },
  { value: 'S', label: 'Suspenso' },
  { value: 'A', label: 'Aguardando' },
  { value: 'F', label: 'Finalizado' },
  { value: 'C', label: 'Cancelado' },
];

const PRIO_OPTIONS = [
  { value: '', label: 'Todas Prioridades' },
  { value: 'A', label: 'Alta' },
  { value: 'M', label: 'Media' },
  { value: 'B', label: 'Baixa' },
];

const selectSx = { fontWeight: 600, fontSize: 13, height: 32, borderRadius: 2 };

export function ChamadosToolbar({
  dataInicio, dataFim, status, prioridade,
  onUpdateParams, onClearAll, totalRegistros, isLoading,
}: ChamadosToolbarProps) {
  const presets = useMemo(() => getPeriodPresets(), []);
  const activePreset = useMemo(
    () => getActivePresetKey(dataInicio, dataFim), [dataInicio, dataFim],
  );

  const handlePresetChange = (key: string) => {
    if (key === '__all') {
      onUpdateParams({ dataInicio: null, dataFim: null });
      return;
    }
    if (key === '__custom') return;
    const preset = presets.find((p) => p.key === key);
    if (preset) onUpdateParams({ dataInicio: preset.ini, dataFim: preset.fim });
  };

  const selectValue = activePreset ?? (dataInicio || dataFim ? '__custom' : '__all');
  const hasFilters = status || prioridade || dataInicio || dataFim;

  return (
    <Paper sx={{
      px: 1.5, py: 1, borderRadius: 3,
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select value={selectValue} onChange={(e) => handlePresetChange(e.target.value)}
            sx={selectSx}>
            {presets.map((p) => (
              <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>
            ))}
            <MenuItem value="__all">Tudo</MenuItem>
            {selectValue === '__custom' && (
              <MenuItem value="__custom">Personalizado</MenuItem>
            )}
          </Select>
        </FormControl>

        <DatePicker
          value={dataInicio ? parseISO(dataInicio) : null}
          onChange={(d) => onUpdateParams({
            dataInicio: d && isValid(d) ? format(d, 'yyyy-MM-dd') : null,
          })}
          format="dd/MM/yyyy"
          slotProps={{ textField: { size: 'small', sx: { width: 145 } } }}
        />
        <DatePicker
          value={dataFim ? parseISO(dataFim) : null}
          onChange={(d) => onUpdateParams({
            dataFim: d && isValid(d) ? format(d, 'yyyy-MM-dd') : null,
          })}
          format="dd/MM/yyyy"
          slotProps={{ textField: { size: 'small', sx: { width: 145 } } }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={status} displayEmpty
            onChange={(e) => onUpdateParams({ status: e.target.value || null })}
            sx={selectSx}>
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select value={prioridade} displayEmpty
            onChange={(e) => onUpdateParams({ prioridade: e.target.value || null })}
            sx={selectSx}>
            {PRIO_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />

        {hasFilters && (
          <Button size="small" startIcon={<FilterAltOff />} onClick={onClearAll}
            sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}>
            Limpar
          </Button>
        )}
        {isLoading && <CircularProgress size={16} />}
        {totalRegistros != null && (
          <Chip size="small" variant="outlined"
            label={`${totalRegistros.toLocaleString('pt-BR')} chamados`} />
        )}
      </Stack>
    </Paper>
  );
}
