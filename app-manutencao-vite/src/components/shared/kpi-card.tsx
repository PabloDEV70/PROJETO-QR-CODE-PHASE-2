import { Box, Paper, Typography, Stack, type SxProps, type Theme } from '@mui/material';

export interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  sx?: SxProps<Theme>;
}

export function KpiCard({ icon, label, value, sub, color = 'primary.main', sx }: KpiCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5, flex: 1, minWidth: 140,
        borderColor: 'divider',
        borderLeft: 3,
        borderLeftColor: color,
        ...sx,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{
          color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 1,
          bgcolor: `${String(color).replace('.main', '')}.50`,
          flexShrink: 0,
        }}>
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', lineHeight: 1.2, fontWeight: 500 }}
          >
            {label}
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {value}
          </Typography>
          {sub && (
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10 }}>
              {sub}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
