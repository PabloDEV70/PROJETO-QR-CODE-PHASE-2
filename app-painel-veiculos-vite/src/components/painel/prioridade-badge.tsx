import { Chip } from '@mui/material';
import { getPrioridadeInfo } from '@/utils/prioridade-constants';

interface PrioridadeBadgeProps {
  idpri: number | null;
}

export function PrioridadeBadge({ idpri }: PrioridadeBadgeProps) {
  const info = getPrioridadeInfo(idpri);
  return (
    <Chip
      label={info.sigla}
      size="small"
      sx={{
        bgcolor: `${info.color}20`,
        color: info.color,
        fontWeight: 700,
        fontSize: '0.7rem',
        minWidth: 24,
        height: 22,
      }}
    />
  );
}
