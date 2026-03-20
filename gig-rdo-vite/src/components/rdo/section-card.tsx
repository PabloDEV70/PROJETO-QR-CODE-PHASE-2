import { Paper, Box, Typography, type SxProps, type Theme } from '@mui/material';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
  sx?: SxProps<Theme>;
}

export function SectionCard({
  title, subtitle, action, children, noPadding, sx,
}: SectionCardProps) {
  return (
    <Paper
      data-hoverable
      sx={[
        { overflow: 'hidden', borderRadius: 3 },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box sx={{
        px: 2.5, py: 1.5, bgcolor: 'grey.50',
        borderBottom: '1px solid', borderColor: 'divider',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
          )}
        </Box>
        {action}
      </Box>
      <Box sx={noPadding ? {} : { p: 2.5 }}>
        {children}
      </Box>
    </Paper>
  );
}
