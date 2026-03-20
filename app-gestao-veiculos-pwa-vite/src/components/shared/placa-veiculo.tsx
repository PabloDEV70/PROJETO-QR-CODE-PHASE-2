import { Box, Typography, type SxProps, type Theme } from '@mui/material';

export interface PlacaVeiculoProps {
  placa: string;
  /** Text on blue bar (default: "BRASIL") */
  label?: string;
  /** Scale factor: 1 = ~120px wide, 0.6 = compact for cards */
  scale?: number;
  sx?: SxProps<Theme>;
}

function formatPlaca(raw: string): string {
  const c = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (c.length === 7) return `${c.slice(0, 3)}${c.charAt(3)}${c.slice(4)}`;
  return c;
}

/**
 * Placa Mercosul brasileira — barra azul "BRASIL" + corpo cinza claro.
 * Compact by default for dashboard cards.
 */
export function PlacaVeiculo({ placa, label = 'BRASIL', scale = 1, sx }: PlacaVeiculoProps) {
  const text = formatPlaca(placa);
  const s = scale;

  return (
    <Box sx={{
      display: 'inline-flex', flexDirection: 'column', overflow: 'hidden',
      borderRadius: `${3 * s}px`, border: `${2 * s}px solid #333`,
      width: 'fit-content', flexShrink: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      ...sx,
    }}>
      {/* Blue top bar */}
      <Box sx={{
        bgcolor: '#003399', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: `${3 * s}px`,
        height: `${14 * s}px`, px: `${4 * s}px`,
      }}>
        <Typography sx={{
          color: '#fff', fontSize: `${7 * s}px`, fontWeight: 700,
          letterSpacing: '0.08em', lineHeight: 1,
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}>
          {label}
        </Typography>
      </Box>

      {/* Plate body */}
      <Box sx={{
        bgcolor: '#e8e8e8', display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        px: `${8 * s}px`, py: `${3 * s}px`,
        minWidth: `${100 * s}px`,
      }}>
        <Typography sx={{
          fontFamily: '"JetBrains Mono", "Courier New", monospace',
          fontSize: `${22 * s}px`, fontWeight: 900,
          color: '#1a1a1a', letterSpacing: `${2 * s}px`,
          lineHeight: 1,
        }}>
          {text}
        </Typography>
      </Box>
    </Box>
  );
}

export default PlacaVeiculo;
