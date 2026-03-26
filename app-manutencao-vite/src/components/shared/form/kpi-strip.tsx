import { Box, Typography, Stack, Divider } from '@mui/material';

interface KpiItem {
  label: string;
  value: string | number;
  color?: string;
  mono?: boolean;
}

interface KpiStripProps {
  items: KpiItem[];
}

export function KpiStrip({ items }: KpiStripProps) {
  return (
    <Stack
      direction="row"
      divider={<Divider orientation="vertical" flexItem />}
      sx={{
        px: 2, py: 1.25,
        bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        overflowX: 'auto',
        gap: 0,
      }}
    >
      {items.map((item) => (
        <Box key={item.label} sx={{ px: 2, minWidth: 'fit-content' }}>
          <Typography sx={{
            fontSize: 10, fontWeight: 700, color: 'text.disabled',
            lineHeight: 1.2, mb: 0.25, whiteSpace: 'nowrap',
          }}>
            {item.label}
          </Typography>
          <Typography sx={{
            fontSize: 14, fontWeight: 800,
            fontFamily: item.mono !== false ? 'monospace' : undefined,
            color: item.color ?? 'text.primary',
            lineHeight: 1.2, whiteSpace: 'nowrap',
          }}>
            {typeof item.value === 'number' ? item.value.toLocaleString('pt-BR') : item.value}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
