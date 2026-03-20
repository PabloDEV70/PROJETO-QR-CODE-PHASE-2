import { Paper, Box, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

interface StatCardProps {
  icon: SvgIconComponent;
  value: number | string;
  label: string;
  color?: string;
}

export function StatCard({ icon: Icon, value, label, color = 'primary.main' }: StatCardProps) {
  return (
    <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${typeof color === 'string' && color.startsWith('#') ? color : ''}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon sx={{ fontSize: 22, color }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1 }}>{value}</Typography>
        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{label}</Typography>
      </Box>
    </Paper>
  );
}
