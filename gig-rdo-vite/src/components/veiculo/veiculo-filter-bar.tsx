import { useState, useEffect } from 'react';
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { VeiculoListFilters, VeiculoStatus } from '@/types/veiculo-list-types';

interface VeiculoFilterBarProps {
  filters: VeiculoListFilters;
  onFiltersChange: (filters: VeiculoListFilters) => void;
  categorias: string[];
  total?: number;
  isLoading: boolean;
}

const STATUS_OPTIONS: { value: VeiculoStatus; label: string }[] = [
  { value: 'LIVRE', label: 'Livre' },
  { value: 'EM_USO', label: 'Em Uso' },
  { value: 'MANUTENCAO', label: 'Em Manutencao' },
  { value: 'AGUARDANDO_MANUTENCAO', label: 'Aguardando Manutencao' },
  { value: 'BLOQUEIO_COMERCIAL', label: 'Bloqueio Comercial' },
  { value: 'PARADO', label: 'Parado' },
  { value: 'ALUGADO_CONTRATO', label: 'Alugado (Contrato)' },
  { value: 'RESERVADO_CONTRATO', label: 'Reservado (Contrato)' },
  { value: 'AGENDADO', label: 'Agendado' },
];

export function VeiculoFilterBar({
  filters,
  onFiltersChange,
  categorias,
  total,
  isLoading,
}: VeiculoFilterBarProps) {
  const [searchLocal, setSearchLocal] = useState(filters.searchTerm ?? '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchLocal !== (filters.searchTerm ?? '')) {
        onFiltersChange({ ...filters, searchTerm: searchLocal || undefined });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchLocal]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
      <TextField
        size="small"
        placeholder="Buscar placa/modelo..."
        value={searchLocal}
        onChange={(e) => setSearchLocal(e.target.value)}
        sx={{ minWidth: 240 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          value={filters.status ?? ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: (e.target.value as VeiculoStatus) || undefined,
            })
          }
        >
          <MenuItem value="">Todos</MenuItem>
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Categoria</InputLabel>
        <Select
          label="Categoria"
          value={filters.categoria ?? ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              categoria: (e.target.value as string) || undefined,
            })
          }
        >
          <MenuItem value="">Todas</MenuItem>
          {categorias.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!isLoading && total != null && (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {total} veiculos
        </Typography>
      )}
    </Stack>
  );
}
