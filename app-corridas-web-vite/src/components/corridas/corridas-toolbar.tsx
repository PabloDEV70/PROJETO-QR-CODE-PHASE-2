import {
  Box, TextField, Select, MenuItem, InputLabel, FormControl,
  IconButton, Badge, Chip, InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Clear, Search, FilterAltOff } from '@mui/icons-material';
import { parseISO, format } from 'date-fns';
import { useCorridasUrlParams } from '@/hooks/use-corridas-url-params';
import { useMotoristas } from '@/hooks/use-corridas';
import { STATUS_LABELS } from '@/types/corrida';

interface CorridasToolbarProps {
  total: number;
}

export function CorridasToolbar({ total }: CorridasToolbarProps) {
  const { params, setParam, clearFilters, activeFilterCount } = useCorridasUrlParams();
  const { data: motoristas } = useMotoristas();

  return (
    <Box
      sx={{
        px: 2, py: 1,
        display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center',
        borderBottom: '1px solid', borderColor: 'divider',
      }}
    >
      <DatePicker
        label="Data inicio"
        value={params.dataInicio ? parseISO(params.dataInicio) : null}
        onChange={(d) => setParam('dataInicio', d ? format(d, 'yyyy-MM-dd') : '')}
        slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
      />
      <DatePicker
        label="Data fim"
        value={params.dataFim ? parseISO(params.dataFim) : null}
        onChange={(d) => setParam('dataFim', d ? format(d, 'yyyy-MM-dd') : '')}
        slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
      />

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          value={params.status}
          onChange={(e) => setParam('status', e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <MenuItem key={k} value={k}>{v}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Motorista</InputLabel>
        <Select
          label="Motorista"
          value={params.motorista}
          onChange={(e) => setParam('motorista', e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          {motoristas?.map((m) => (
            <MenuItem key={m.CODUSU} value={String(m.CODUSU)}>{m.NOMEUSU}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        placeholder="Buscar..."
        value={params.search}
        onChange={(e) => setParam('search', e.target.value)}
        sx={{ width: 200 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 18, color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: params.search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setParam('search', '')}>
                  <Clear sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />

      {activeFilterCount > 0 && (
        <Badge badgeContent={activeFilterCount} color="primary">
          <IconButton size="small" onClick={clearFilters} title="Limpar filtros">
            <FilterAltOff fontSize="small" />
          </IconButton>
        </Badge>
      )}

      <Box sx={{ flex: 1 }} />

      <Chip
        label={`${total} registro${total !== 1 ? 's' : ''}`}
        size="small"
        variant="outlined"
      />
    </Box>
  );
}
