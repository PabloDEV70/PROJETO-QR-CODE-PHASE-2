import { Box, Typography } from '@mui/material';

interface FieldGroupProps {
  title: string;
  children: React.ReactNode;
}

export function FieldGroup({ title, children }: FieldGroupProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{
        fontSize: 11, fontWeight: 700, color: 'text.disabled',
        mb: 1.5, pb: 0.5,
        borderBottom: '1px solid', borderColor: 'divider',
      }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
