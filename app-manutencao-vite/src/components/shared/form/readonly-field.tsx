import { Box, Typography, Stack } from '@mui/material';

interface ReadonlyFieldProps {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function ReadonlyField({ label, value, mono, icon, size = 'md', color }: ReadonlyFieldProps) {
  const display = value == null || value === '' ? '-' : typeof value === 'object' ? '-' : String(value);
  const isEmpty = display === '-';

  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 13;
  const labelSize = size === 'sm' ? 10 : 11;

  return (
    <Box sx={{ py: 0.5 }}>
      <Typography sx={{
        fontSize: labelSize, fontWeight: 600, color: 'text.disabled',
        lineHeight: 1.2, mb: 0.25,
      }}>
        {label}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        {icon}
        <Typography sx={{
          fontSize,
          fontWeight: isEmpty ? 400 : 700,
          color: color ?? (isEmpty ? 'text.disabled' : 'text.primary'),
          fontFamily: mono ? 'monospace' : undefined,
          lineHeight: 1.3,
          wordBreak: 'break-word',
        }}>
          {display}
        </Typography>
      </Stack>
    </Box>
  );
}
