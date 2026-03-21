import { FormControl, Select, MenuItem, type SelectChangeEvent } from '@mui/material';
import { filterInputRootSx } from '@/components/shared/input-styles';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  displayEmpty?: boolean;
  minWidth?: number | string | Record<string, number | string>;
}

export function FilterSelect({
  value, options, onChange, displayEmpty, minWidth,
}: FilterSelectProps) {
  const handleChange = (e: SelectChangeEvent<string>) => onChange(e.target.value);

  return (
    <FormControl size="small" sx={{ minWidth: minWidth ?? 130 }}>
      <Select
        value={value}
        displayEmpty={displayEmpty}
        onChange={handleChange}
        sx={filterInputRootSx}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
