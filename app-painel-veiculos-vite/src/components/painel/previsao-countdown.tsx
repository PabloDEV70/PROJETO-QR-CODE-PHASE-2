import { Typography } from '@mui/material';
import { calcPrevisaoCountdown } from '@/utils/previsao-utils';

interface PrevisaoCountdownProps {
  dtprevisao: string | null;
}

export function PrevisaoCountdown({ dtprevisao }: PrevisaoCountdownProps) {
  const info = calcPrevisaoCountdown(dtprevisao);
  if (!info) return null;

  return (
    <Typography
      sx={{
        fontSize: '0.7rem',
        fontWeight: 700,
        color: info.isOverdue ? '#f44336' : '#4caf50',
        whiteSpace: 'nowrap',
      }}
    >
      {info.isOverdue ? 'ATRASADO' : info.text}
    </Typography>
  );
}
