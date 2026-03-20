import { Box, Typography } from '@mui/material';
import { SearchOff } from '@mui/icons-material';

interface EmptyStateProps {
  message?: string;
  submessage?: string;
}

export function EmptyState({
  message = 'Nenhum registro encontrado',
  submessage,
}: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
      <SearchOff sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
      <Typography variant="h6">{message}</Typography>
      {submessage && <Typography variant="body2">{submessage}</Typography>}
    </Box>
  );
}
