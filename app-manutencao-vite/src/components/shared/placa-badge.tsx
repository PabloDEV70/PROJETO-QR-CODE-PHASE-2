import { Box, Typography, type SxProps, type Theme } from '@mui/material';

interface PlacaBadgeProps {
  placa: string | null;
  marcaModelo?: string | null;
  tag?: string | null;
  size?: 'sm' | 'md';
  sx?: SxProps<Theme>;
}

function formatPlaca(raw: string): string {
  const c = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (c.length === 7) return `${c.slice(0, 3)}${c.charAt(3)}${c.slice(4)}`;
  return c;
}

export function PlacaBadge({ placa, marcaModelo, tag, size = 'md', sx }: PlacaBadgeProps) {
  const s = size === 'sm' ? 0.55 : 0.75;

  if (!placa) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, ...sx }}>
        <Box sx={{
          width: 100 * s, height: 38 * s,
          borderRadius: `${3 * s}px`, border: '2px dashed', borderColor: 'divider',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography sx={{ fontSize: 9 * s + 3, color: 'text.disabled' }}>
            S/ placa
          </Typography>
        </Box>
        {tag && (
          <Typography sx={{ fontSize: 11, color: 'primary.main', fontWeight: 700 }}>
            {tag}
          </Typography>
        )}
      </Box>
    );
  }

  const text = formatPlaca(placa);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, minWidth: 0, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Placa Mercosul */}
        <Box sx={{
          display: 'inline-flex', flexDirection: 'column', overflow: 'hidden',
          borderRadius: `${3 * s}px`, border: `${2 * s}px solid #333`,
          width: 'fit-content', flexShrink: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
        }}>
          {/* Blue top bar */}
          <Box sx={{
            bgcolor: '#003399', display: 'flex', alignItems: 'center',
            justifyContent: 'center', height: `${14 * s}px`, px: `${4 * s}px`,
          }}>
            <Typography sx={{
              color: '#fff', fontSize: `${7 * s}px`, fontWeight: 700,
              letterSpacing: '0.08em', lineHeight: 1,
              fontFamily: 'Arial, Helvetica, sans-serif',
            }}>
              BRASIL
            </Typography>
          </Box>
          {/* Plate body */}
          <Box sx={{
            bgcolor: '#e8e8e8', display: 'flex', alignItems: 'center',
            justifyContent: 'center', px: `${8 * s}px`, py: `${3 * s}px`,
            minWidth: `${100 * s}px`,
          }}>
            <Typography sx={{
              fontFamily: '"JetBrains Mono", "Courier New", monospace',
              fontSize: `${22 * s}px`, fontWeight: 900,
              color: '#1a1a1a', letterSpacing: `${2 * s}px`, lineHeight: 1,
            }}>
              {text}
            </Typography>
          </Box>
        </Box>

        {tag && (
          <Typography sx={{
            fontSize: size === 'sm' ? 10 : 12, fontWeight: 700,
            color: 'primary.main', lineHeight: 1,
          }}>
            {tag}
          </Typography>
        )}
      </Box>
      {marcaModelo && (
        <Typography noWrap sx={{
          fontSize: size === 'sm' ? 10 : 12, color: 'text.secondary',
          lineHeight: 1.2, maxWidth: size === 'sm' ? 160 : 220,
        }}>
          {marcaModelo}
        </Typography>
      )}
    </Box>
  );
}
