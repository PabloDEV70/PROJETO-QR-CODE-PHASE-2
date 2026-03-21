import { Box, Stack, Typography } from '@mui/material';
import { InboxRounded } from '@mui/icons-material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{
      py: 8,
      border: '1px dashed',
      borderColor: 'divider',
      borderRadius: 2,
      bgcolor: 'action.hover',
    }}>
      <Box sx={{
        width: 56, height: 56, borderRadius: '50%',
        bgcolor: 'action.selected', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        mb: 2,
      }}>
        {icon ?? <InboxRounded sx={{ fontSize: 28, color: 'text.disabled' }} />}
      </Box>
      <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 14 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ color: 'text.disabled', fontSize: 12, mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  );
}
