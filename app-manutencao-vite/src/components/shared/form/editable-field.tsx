import { TextField, MenuItem } from '@mui/material';

interface Option {
  value: string;
  label: string;
}

interface EditableFieldProps {
  label: string;
  value: string | number | null | undefined;
  onChange?: (value: string) => void;
  type?: 'text' | 'number';
  select?: boolean;
  options?: Option[];
  mono?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const sx = {
  '& .MuiInputBase-root': {
    borderRadius: '6px',
    fontSize: 13,
    fontWeight: 600,
    bgcolor: 'background.paper',
    height: 38,
  },
  '& .MuiInputLabel-root': {
    fontSize: 12,
    fontWeight: 600,
    color: 'text.secondary',
    '&.Mui-focused': { color: 'primary.main' },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'divider',
  },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'text.secondary',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'primary.main',
    borderWidth: 1.5,
  },
};

export function EditableField({
  label, value, onChange, type = 'text', select, options,
  mono, disabled, placeholder,
}: EditableFieldProps) {
  const v = value == null ? '' : String(value);

  return (
    <TextField
      label={label}
      value={v}
      onChange={(e) => onChange?.(e.target.value)}
      type={type}
      select={select}
      disabled={disabled}
      placeholder={placeholder}
      size="small"
      fullWidth
      variant="outlined"
      sx={{
        ...sx,
        ...(mono ? { '& .MuiInputBase-input': { fontFamily: 'monospace' } } : {}),
      }}
    >
      {select && options?.map((opt) => (
        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13, fontWeight: 600 }}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
