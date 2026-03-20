import { Stack, Box, Typography } from '@mui/material';

interface ChamadoDetailChipProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}

export function ChamadoDetailChip({ icon, label, value }: ChamadoDetailChipProps) {
  if (!value || value === '-') return null;
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
      <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Stack>
  );
}
