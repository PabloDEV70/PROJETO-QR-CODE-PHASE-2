import {
  Box,
  Chip,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search,
  ViewModule,
  ViewList,
  TableChart,
  CheckCircle,
  FilterList,
} from '@mui/icons-material';

export type ViewMode = 'grid' | 'list' | 'table';
export type SortOption =
  | 'nome-asc'
  | 'nome-desc'
  | 'estoque-asc'
  | 'estoque-desc'
  | 'codigo';

interface EstoqueToolbarProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
  filteredCount: number;
  hideDesativados: boolean;
  onHideDesativadosChange: (hide: boolean) => void;
}

export function EstoqueToolbar({
  viewMode,
  onViewChange,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  totalCount,
  filteredCount,
  hideDesativados,
  onHideDesativadosChange,
}: EstoqueToolbarProps) {
  const showSort = viewMode !== 'table';
  const hasFilter = filteredCount !== totalCount;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        size="small"
        onChange={(_, v) => v && onViewChange(v)}
      >
        <ToggleButton value="grid"><ViewModule fontSize="small" /></ToggleButton>
        <ToggleButton value="list"><ViewList fontSize="small" /></ToggleButton>
        <ToggleButton value="table"><TableChart fontSize="small" /></ToggleButton>
      </ToggleButtonGroup>

      <TextField
        placeholder="Buscar nome, código, localização..."
        size="small"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flex: 1, minWidth: 180 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      {showSort && (
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            <MenuItem value="nome-asc">Nome A-Z</MenuItem>
            <MenuItem value="nome-desc">Nome Z-A</MenuItem>
            <MenuItem value="estoque-asc">Estoque ↑</MenuItem>
            <MenuItem value="estoque-desc">Estoque ↓</MenuItem>
            <MenuItem value="codigo">Código</MenuItem>
          </Select>
        </FormControl>
      )}

      <Chip
        icon={hideDesativados ? <CheckCircle /> : <FilterList />}
        label={hideDesativados ? 'Ativos' : 'Todos'}
        size="small"
        variant={hideDesativados ? 'filled' : 'outlined'}
        onClick={() => onHideDesativadosChange(!hideDesativados)}
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          cursor: 'pointer',
          ...(hideDesativados
            ? {
                bgcolor: 'success.light',
                color: 'success.dark',
                '& .MuiChip-icon': { color: 'success.dark', fontSize: 16 },
              }
            : {
                borderColor: 'divider',
                color: 'text.secondary',
                '& .MuiChip-icon': { color: 'text.disabled', fontSize: 16 },
              }),
        }}
      />

      <Chip
        label={
          hasFilter
            ? `${filteredCount} de ${totalCount}`
            : `${totalCount} produtos`
        }
        color="primary"
        variant="outlined"
        size="small"
      />
    </Box>
  );
}
