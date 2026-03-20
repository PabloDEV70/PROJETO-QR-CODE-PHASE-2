import { Box, Typography } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ message = 'Nenhum resultado encontrado', icon }: EmptyStateProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 1, color: 'text.disabled' }}>
      {icon ?? <InboxOutlined sx={{ fontSize: 48 }} />}
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
}
