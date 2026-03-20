import { TextField, MenuItem, CircularProgress, Stack, Box } from '@mui/material';
import { usePrioridades } from '@/hooks/use-hstvei';

const PRI_COLORS: Record<number, string> = { 0: '#d32f2f', 1: '#ed6c02', 2: '#2e7d32', 3: '#9e9e9e' };

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
      select label="Prioridade" value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      fullWidth required={required} disabled={disabled || isLoading} size="small"
      slotProps={{ input: { endAdornment: isLoading ? <CircularProgress size={16} /> : undefined } }}
    >
      {(prioridades ?? []).map((p) => (
        <MenuItem key={p.IDPRI} value={p.IDPRI}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: PRI_COLORS[p.IDPRI] ?? '#999' }} />
            <span>{p.SIGLA} — {p.DESCRICAO}</span>
          </Stack>
        </MenuItem>
      ))}
    </TextField>
  );
}
