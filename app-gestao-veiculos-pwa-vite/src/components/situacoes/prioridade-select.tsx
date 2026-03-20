import { TextField, MenuItem, CircularProgress } from '@mui/material';
import { usePrioridades } from '@/hooks/use-hstvei-lookups';

interface PrioridadeSelectProps {
  value: number | '';
  onChange: (value: number) => void;
  required?: boolean;
  disabled?: boolean;
}

export function PrioridadeSelect({ value, onChange, required, disabled }: PrioridadeSelectProps) {
  const { data: prioridades, isLoading } = usePrioridades();

  return (
    <TextField
      select
      label="Prioridade"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      fullWidth
      required={required}
      disabled={disabled || isLoading}
      size="small"
      slotProps={{
        input: {
          endAdornment: isLoading ? <CircularProgress size={16} /> : undefined,
        },
      }}
    >
      {(prioridades ?? []).map((p) => (
        <MenuItem key={p.IDPRI} value={p.IDPRI}>
          {p.SIGLA} — {p.DESCRICAO}
        </MenuItem>
      ))}
    </TextField>
  );
}
