import { Box, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

interface StatsMetricProps {
  icon: SvgIconComponent;
  value: number | string;
  label: string;
  color?: string;
}

export function StatsMetric({ icon: Icon, value, label, color = '#66bb6a' }: StatsMetricProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75 }}>
      <Icon sx={{ fontSize: 20, color }} />
      <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}
