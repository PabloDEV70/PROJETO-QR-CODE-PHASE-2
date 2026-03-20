import { Box, Typography, Stack, Paper } from '@mui/material';

/** Format minutes as "Xh00" or "Xmin" */
export function fm(min: number): string {
  if (!min) return '0min';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}min`;
}

export function Row({ icon, label, value, sub, color, indent }: {
  icon?: React.ReactNode; label: string; value: string;
  sub?: string; color?: string; indent?: boolean;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}
      sx={{ py: 0.3, pl: indent ? 3 : 0 }}>
      {icon && <Box sx={{ color: color || 'text.secondary', display: 'flex' }}>{icon}</Box>}
      <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{label}</Typography>
      <Stack alignItems="flex-end">
        <Typography variant="body2" fontWeight={600} color={color}>{value}</Typography>
        {sub && <Typography variant="caption" color="text.disabled">{sub}</Typography>}
      </Stack>
    </Stack>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}
