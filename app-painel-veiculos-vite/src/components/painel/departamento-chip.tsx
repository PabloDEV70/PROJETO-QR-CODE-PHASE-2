import { Chip } from '@mui/material';
import { getDepartamentoInfo } from '@/utils/departamento-constants';

interface DepartamentoChipProps {
  coddep: number;
}

export function DepartamentoChip({ coddep }: DepartamentoChipProps) {
  const info = getDepartamentoInfo(coddep);
  const { Icon } = info;
  return (
    <Chip
      icon={<Icon sx={{ fontSize: 14 }} />}
      label={info.label}
      size="small"
      sx={{
        bgcolor: `${info.color}15`,
        color: info.color,
        fontWeight: 600,
        fontSize: '0.65rem',
        height: 22,
        '& .MuiChip-icon': { color: info.color },
      }}
    />
  );
}
