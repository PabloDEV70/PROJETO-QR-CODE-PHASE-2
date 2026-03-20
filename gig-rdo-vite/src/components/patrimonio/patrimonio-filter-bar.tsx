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
import type { PatrimonioListFilters } from '@/types/patrimonio-types';

interface PatrimonioFilterBarProps {
  filters: PatrimonioListFilters;
  onFiltersChange: (filters: PatrimonioListFilters) => void;
  categorias: string[];
  total: number;
  isLoading: boolean;
}

export function PatrimonioFilterBar({
  filters,
  onFiltersChange,
  categorias,
  total,
  isLoading,
}: PatrimonioFilterBarProps) {
  const [searchLocal, setSearchLocal] = useState(filters.search ?? '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchLocal !== (filters.search ?? '')) {
        onFiltersChange({ ...filters, search: searchLocal || undefined });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchLocal]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center" gap={1.5}>
      <TextField
        size="small"
        placeholder="Buscar por TAG, placa ou descricao"
        value={searchLocal}
        onChange={(e) => setSearchLocal(e.target.value)}
        sx={{ minWidth: 280 }}
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
          {categorias.map((cat, idx) => (
            <MenuItem key={`${cat}-${idx}`} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          value={filters.status ?? 'todos'}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: (e.target.value as PatrimonioListFilters['status']) || undefined,
            })
          }
        >
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="ativo">Ativo</MenuItem>
          <MenuItem value="baixado">Baixado</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Mobilizado</InputLabel>
        <Select
          label="Mobilizado"
          value={filters.mobilizado ?? 'todos'}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              mobilizado: (e.target.value as PatrimonioListFilters['mobilizado']) || undefined,
            })
          }
        >
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="sim">Sim</MenuItem>
          <MenuItem value="nao">Nao</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Tem Patrimonio</InputLabel>
        <Select
          label="Tem Patrimonio"
          value={filters.temPatrimonio ?? 'todos'}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              temPatrimonio:
                (e.target.value as PatrimonioListFilters['temPatrimonio']) || undefined,
            })
          }
        >
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="sim">Sim</MenuItem>
          <MenuItem value="nao">Nao</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 110 }}>
        <InputLabel>Empresa</InputLabel>
        <Select
          label="Empresa"
          value={filters.empresa ?? ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              empresa: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3</MenuItem>
        </Select>
      </FormControl>

      {!isLoading && (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {total} bens
        </Typography>
      )}
    </Stack>
  );
}
