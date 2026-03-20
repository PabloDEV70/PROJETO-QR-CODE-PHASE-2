import { Chip } from '@mui/material';
import {
  Build,
  Wc,
  Restaurant,
  DirectionsCar,
  HourglassEmpty,
  SmokingRooms,
  School,
  MoreHoriz,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

/** Inline color map for motivo codes (source: AD_RDOMOTIVOS) */
const MOTIVO_COLORS: Record<number, { sigla: string; color: string; icon: SvgIconComponent }> = {
  1:  { sigla: 'ATVP',   color: '#2e7d32', icon: Build },
  2:  { sigla: 'BANH',   color: '#0288d1', icon: Wc },
  3:  { sigla: 'ALMOC',  color: '#f57c00', icon: Restaurant },
  4:  { sigla: 'LANCHE', color: '#8d6e63', icon: Restaurant },
  5:  { sigla: 'SOCORR', color: '#d32f2f', icon: MoreHoriz },
  6:  { sigla: 'FUMAR',  color: '#e53935', icon: SmokingRooms },
  7:  { sigla: '5S',     color: '#7b1fa2', icon: Build },
  8:  { sigla: 'PECAS',  color: '#00897b', icon: Build },
  9:  { sigla: 'ATESTA', color: '#558b2f', icon: MoreHoriz },
  10: { sigla: 'DESLOC', color: '#5c6bc0', icon: DirectionsCar },
  11: { sigla: 'ALINHAM', color: '#1565c0', icon: MoreHoriz },
  12: { sigla: 'DDS',    color: '#c62828', icon: MoreHoriz },
  13: { sigla: 'TREINO', color: '#00695c', icon: School },
  14: { sigla: 'AGPECA', color: '#78909c', icon: HourglassEmpty },
  15: { sigla: 'AGEXT',  color: '#546e7a', icon: HourglassEmpty },
  16: { sigla: 'AGD',    color: '#455a64', icon: HourglassEmpty },
  17: { sigla: 'CLIMA',  color: '#0277bd', icon: MoreHoriz },
  18: { sigla: 'PESSOAL', color: '#ad1457', icon: MoreHoriz },
  19: { sigla: 'EPI',    color: '#6a1b9a', icon: MoreHoriz },
  20: { sigla: 'O.S',    color: '#37474f', icon: MoreHoriz },
};

const DEFAULT_COLOR = '#757575';

function resolveMotivo(cod: number | null, sigla?: string) {
  if (cod != null && MOTIVO_COLORS[cod]) return MOTIVO_COLORS[cod];
  return { sigla: sigla || '?', color: DEFAULT_COLOR, icon: MoreHoriz };
}

interface MotivoChipProps {
  cod: number | null;
  sigla?: string;
  label?: string;
  isProd?: boolean;
  size?: 'small' | 'medium';
}

export function MotivoChip({
  cod,
  sigla,
  label,
  isProd,
  size = 'small',
}: MotivoChipProps) {
  const entry = resolveMotivo(cod, sigla);
  const Icon = entry.icon;

  return (
    <Chip
      icon={
        <Icon
          sx={{ fontSize: 14, color: `${entry.color} !important` }}
        />
      }
      label={label || entry.sigla}
      size={size}
      sx={{
        fontWeight: 600,
        fontSize: 11,
        height: size === 'small' ? 22 : 28,
        borderLeft: 3,
        borderColor: entry.color,
        bgcolor: isProd != null
          ? (isProd ? 'success.light' : 'warning.light')
          : `${entry.color}14`,
        color: isProd != null
          ? (isProd ? 'success.dark' : 'warning.dark')
          : 'text.primary',
      }}
    />
  );
}
