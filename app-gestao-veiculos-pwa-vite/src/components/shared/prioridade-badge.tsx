import { Chip } from '@mui/material';
import { getPrioridadeInfo } from '@/utils/prioridade-constants';

interface PrioridadeBadgeProps {
  idpri: number | null;
  size?: 'small' | 'medium';
}

export function PrioridadeBadge({ idpri, size = 'small' }: PrioridadeBadgeProps) {
  const info = getPrioridadeInfo(idpri);
  return (
    <Chip
      label={info.sigla}
      size={size}
      sx={{
        bgcolor: `${info.color}20`,
        color: info.color,
        fontWeight: 700,
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
        minWidth: 24,
        height: size === 'small' ? 22 : 28,
      }}
    />
  );
}
