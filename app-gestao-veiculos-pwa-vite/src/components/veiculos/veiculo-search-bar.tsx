import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

interface VeiculoSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function VeiculoSearchBar({ value, onChange }: VeiculoSearchBarProps) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Buscar por placa ou tag..."
      fullWidth
      size="small"
      sx={{ mb: 1.5 }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ fontSize: 20, color: 'text.disabled' }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
