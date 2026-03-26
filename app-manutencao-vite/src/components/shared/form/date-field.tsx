import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { parseISO, isValid } from 'date-fns';

interface DateFieldProps {
  label: string;
  value: string | null | undefined;
  onChange?: (value: Date | null) => void;
  readOnly?: boolean;
  highlight?: boolean;
}

const sx = {
  '& .MuiInputBase-root': {
    borderRadius: '6px',
    fontSize: 13,
    fontWeight: 600,
    height: 38,
  },
  '& .MuiInputLabel-root': {
    fontSize: 12,
    fontWeight: 600,
    color: 'text.secondary',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'divider',
  },
};

export function DateField({ label, value, onChange, readOnly, highlight }: DateFieldProps) {
  const parsed = value ? parseISO(value) : null;
  const dateValue = parsed && isValid(parsed) ? parsed : null;

  return (
    <DateTimePicker
      label={label}
      value={dateValue}
      onChange={(v) => onChange?.(v)}
      readOnly={readOnly}
      format="dd/MM/yy HH:mm"
      ampm={false}
      slotProps={{
        textField: {
          size: 'small',
          fullWidth: true,
          variant: 'outlined',
          sx: {
            ...sx,
            ...(readOnly ? {
              '& .MuiInputBase-root': {
                ...sx['& .MuiInputBase-root'],
                bgcolor: 'transparent',
              },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
            } : {}),
            ...(highlight ? {
              '& .MuiInputBase-input': { color: 'primary.main', fontWeight: 800 },
            } : {}),
          },
        },
      }}
    />
  );
}
