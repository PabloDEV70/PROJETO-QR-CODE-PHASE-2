import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { parseISO, isValid } from 'date-fns';
import { filterFieldSx } from '@/components/shared/input-styles';

interface FilterDateTimePickerProps {
  value: string | null;
  onChange: (iso: string | null) => void;
  placeholder?: string;
  width?: number | string | Record<string, number | string>;
}

export function FilterDateTimePicker({
  value, onChange, placeholder = 'dd/mm/aaaa hh:mm', width,
}: FilterDateTimePickerProps) {
  return (
    <DateTimePicker
      value={value ? parseISO(value) : null}
      onChange={(d) => onChange(d && isValid(d) ? d.toISOString() : null)}
      format="dd/MM/yyyy HH:mm"
      ampm={false}
      slotProps={{
        textField: {
          size: 'small',
          placeholder,
          sx: { width: width ?? 190, ...filterFieldSx },
        },
      }}
    />
  );
}
