import { Box, Typography, type SxProps, type Theme } from '@mui/material';
import { DirectionsCar } from '@mui/icons-material';
import { PlacaVeiculo } from './placa-veiculo';

export interface VeiculoData {
  placa: string;
  marcamodelo?: string | null;
  tag?: string | null;
  categoria?: string | null;
  ano?: number | string | null;
  km?: number | null;
}

export interface VeiculoCardProps {
  /** Vehicle data — only placa is required */
  veiculo: VeiculoData;
  /** Layout: 'horizontal' side-by-side, 'vertical' stacked */
  layout?: 'horizontal' | 'vertical';
  /** PlacaVeiculo scale */
  placaScale?: number;
  /** Show all details or compact */
  compact?: boolean;
  /** Click handler */
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

function formatKm(km: number | null | undefined): string {
  if (km == null || km <= 0) return '';
  return km >= 1000 ? `${(km / 1000).toFixed(1)}k km` : `${km} km`;
}

/**
 * Reusable vehicle display component.
 *
 * Usage:
 *   <VeiculoCard veiculo={{ placa: 'GVQ7G93', marcamodelo: 'VW/24.250', tag: 'GGO-4308' }} />
 *   <VeiculoCard veiculo={v} layout="vertical" placaScale={0.7} />
 *   <VeiculoCard veiculo={v} compact />
 */
export function VeiculoCard({ veiculo, layout = 'horizontal', placaScale = 0.5, compact = false, onClick, sx }: VeiculoCardProps) {
  const { placa, marcamodelo, tag, categoria, ano, km } = veiculo;
  const kmStr = formatKm(km);
  const anoStr = ano ? String(ano) : '';
  const isH = layout === 'horizontal';

  if (!placa) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ...sx }}>
        <DirectionsCar sx={{ fontSize: 16, color: 'text.disabled' }} />
        <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>Sem veiculo</Typography>
      </Box>
    );
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: isH ? 'row' : 'column',
        alignItems: isH ? 'center' : 'center',
        gap: isH ? 1 : 0.5,
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
    >
      <PlacaVeiculo placa={placa} label={tag || categoria || 'BRASIL'} scale={placaScale} />

      {!compact && (marcamodelo || tag || anoStr || kmStr) && (
        <Box sx={{ minWidth: 0, flex: isH ? 1 : undefined, textAlign: isH ? 'left' : 'center' }}>
          {marcamodelo && (
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.25, color: '#333' }} noWrap>
              {marcamodelo}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: isH ? 'flex-start' : 'center' }}>
            {tag && (
              <Typography sx={{ fontSize: '0.62rem', color: 'primary.main', fontWeight: 700 }}>
                {tag}
              </Typography>
            )}
            {categoria && categoria !== tag && (
              <Typography sx={{ fontSize: '0.58rem', color: 'text.disabled', fontWeight: 600 }}>
                {categoria}
              </Typography>
            )}
            {anoStr && (
              <Typography sx={{ fontSize: '0.55rem', color: 'text.disabled' }}>
                {anoStr}
              </Typography>
            )}
            {kmStr && (
              <Typography sx={{ fontSize: '0.55rem', color: 'text.disabled', fontFamily: 'monospace' }}>
                {kmStr}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
