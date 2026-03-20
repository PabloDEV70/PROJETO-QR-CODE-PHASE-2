import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { filterFieldSx } from '@/components/shared/input-styles';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number | string | Record<string, number | string>;
}

export function SearchInput({
  value, onChange, placeholder = 'Buscar...', width,
}: SearchInputProps) {
  return (
    <TextField
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      sx={{ width: width ?? 260, ...filterFieldSx }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ fontSize: 18 }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
