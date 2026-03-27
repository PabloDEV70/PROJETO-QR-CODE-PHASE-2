import { Box, Typography, Button } from '@mui/material';
import { SearchOff } from '@mui/icons-material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
      <Box sx={{ color: 'text.disabled', mb: 2 }}>
        {icon ?? <SearchOff sx={{ fontSize: 48 }} />}
      </Box>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="outlined" onClick={onAction}>{actionLabel}</Button>
      )}
    </Box>
  );
}
