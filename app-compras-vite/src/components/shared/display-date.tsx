import { Typography, Tooltip, type SxProps, type Theme } from '@mui/material';
import { fmtDateTime, fmtDateShort, elapsedText } from '@/utils/date-helpers';

type DateFormat = 'datetime' | 'short' | 'full';

interface DisplayDateProps {
  value: string | null;
  format?: DateFormat;
  showTooltip?: boolean;
  sx?: SxProps<Theme>;
}

function formatValue(value: string | null, fmt: DateFormat): string {
  if (!value) return '-';
  switch (fmt) {
    case 'short':
      return fmtDateShort(value);
    case 'full':
      return new Date(value).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    case 'datetime':
    default:
      return fmtDateTime(value);
  }
}

export function DisplayDate({ value, format: fmt = 'datetime', showTooltip = true, sx }: DisplayDateProps) {
  const formatted = formatValue(value, fmt);
  const elapsed = value ? elapsedText(value) : null;

  const text = (
    <Typography sx={{
      fontSize: 12,
      color: 'text.secondary',
      fontVariantNumeric: 'tabular-nums',
      ...sx,
    }}>
      {formatted}
    </Typography>
  );

  if (showTooltip && elapsed) {
    return (
      <Tooltip title={elapsed} placement="top" arrow>
        {text}
      </Tooltip>
    );
  }

  return text;
}
