import { Chip } from '@mui/material';
import { getDepartamentoInfo } from '@/utils/departamento-constants';

interface DepartamentoChipProps {
  departamento: string | null | undefined;
  size?: 'small' | 'medium';
}

export function DepartamentoChip({ departamento, size = 'small' }: DepartamentoChipProps) {
  const info = getDepartamentoInfo(departamento);
  const { Icon } = info;
  return (
    <Chip
      icon={<Icon sx={{ fontSize: size === 'small' ? 14 : 16 }} />}
      label={info.label}
      size={size}
      sx={{
        bgcolor: info.bgLight,
        color: info.color,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.65rem' : '0.75rem',
        height: size === 'small' ? 22 : 28,
        '& .MuiChip-icon': { color: info.color },
      }}
    />
  );
}
