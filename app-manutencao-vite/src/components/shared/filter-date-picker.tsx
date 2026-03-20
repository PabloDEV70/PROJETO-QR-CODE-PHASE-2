import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { parseISO, format, isValid } from 'date-fns';
import { filterFieldSx } from '@/components/shared/input-styles';

interface FilterDatePickerProps {
  value: string | null;
  onChange: (iso: string | null) => void;
  placeholder?: string;
  width?: number | string | Record<string, number | string>;
}

export function FilterDatePicker({
  value, onChange, placeholder = 'dd/mm/aaaa', width,
}: FilterDatePickerProps) {
  return (
    <DatePicker
      value={value ? parseISO(value) : null}
      onChange={(d) => onChange(d && isValid(d) ? format(d, 'yyyy-MM-dd') : null)}
      format="dd/MM/yyyy"
      slotProps={{
        textField: {
          size: 'small',
          placeholder,
          sx: { width: width ?? 150, ...filterFieldSx },
        },
      }}
    />
  );
}
