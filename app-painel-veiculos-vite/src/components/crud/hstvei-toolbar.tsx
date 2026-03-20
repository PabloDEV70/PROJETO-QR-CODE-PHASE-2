import { Box, Chip, FormControl, InputLabel, Select, MenuItem, ToggleButtonGroup, ToggleButton, TextField, Button, InputAdornment } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { DEPARTAMENTO_MAP } from '@/utils/departamento-constants';
import { PRIORIDADE_MAP } from '@/utils/prioridade-constants';

export type StatusFilter = 'ativas' | 'encerradas' | 'todas';

interface HstVeiToolbarProps {
  statusFilter: StatusFilter;
  onStatusFilter: (v: StatusFilter) => void;
  depFilters: number[];
  onDepFilters: (v: number[]) => void;
  priFilter: number | '';
  onPriFilter: (v: number | '') => void;
  search: string;
  onSearch: (v: string) => void;
  onNova: () => void;
}

export function HstVeiToolbar({
  statusFilter, onStatusFilter,
  depFilters, onDepFilters,
  priFilter, onPriFilter,
  search, onSearch,
  onNova,
}: HstVeiToolbarProps) {
  const toggleDep = (coddep: number) => {
    onDepFilters(
      depFilters.includes(coddep)
        ? depFilters.filter((d) => d !== coddep)
        : [...depFilters, coddep],
    );
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      {/* Status toggle */}
      <ToggleButtonGroup
        value={statusFilter}
        exclusive
        onChange={(_, v) => { if (v) onStatusFilter(v); }}
        size="small"
        sx={{ '& .MuiToggleButton-root': { px: 1.5, py: 0.4, fontSize: '0.72rem' } }}
      >
        <ToggleButton value="ativas">Ativas</ToggleButton>
        <ToggleButton value="encerradas">Encerradas</ToggleButton>
        <ToggleButton value="todas">Todas</ToggleButton>
      </ToggleButtonGroup>

      {/* Department chips */}
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {Object.entries(DEPARTAMENTO_MAP).map(([key, dep]) => {
          const coddep = Number(key);
          const active = depFilters.includes(coddep);
          return (
            <Chip
              key={coddep}
              label={dep.label}
              size="small"
              onClick={() => toggleDep(coddep)}
              sx={{
                fontWeight: 600, fontSize: '0.7rem', height: 26,
                bgcolor: active ? dep.color : 'transparent',
                color: active ? '#fff' : dep.color,
                border: `1px solid ${dep.color}`,
                '&:hover': { bgcolor: active ? dep.color : `${dep.color}22` },
              }}
            />
          );
        })}
      </Box>

      {/* Prioridade select */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel sx={{ fontSize: '0.75rem' }}>Prioridade</InputLabel>
        <Select
          value={priFilter}
          label="Prioridade"
          onChange={(e) => onPriFilter(e.target.value as number | '')}
          sx={{ fontSize: '0.8rem' }}
        >
          <MenuItem value="">Todas</MenuItem>
          {Object.entries(PRIORIDADE_MAP).map(([key, pri]) => (
            <MenuItem key={key} value={Number(key)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: pri.color }} />
                {pri.label}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Quick filter */}
      <TextField
        size="small"
        placeholder="Buscar placa/tag..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 16 }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ width: 180, '& input': { fontSize: '0.8rem', py: 0.6 } }}
      />

      <Box sx={{ flex: 1 }} />

      {/* Nova situacao */}
      <Button variant="contained" size="small" startIcon={<Add />} onClick={onNova} sx={{ fontSize: '0.75rem', textTransform: 'none' }}>
        Nova Situacao
      </Button>
    </Box>
  );
}
