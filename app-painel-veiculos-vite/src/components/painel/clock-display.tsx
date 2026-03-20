import { Typography } from '@mui/material';
import { useClock } from '@/hooks/use-clock';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ClockDisplay() {
  const time = useClock();

  return (
    <Typography
      sx={{
        position: 'fixed', top: 12, right: 16, zIndex: 10,
        fontSize: '1rem', fontWeight: 600, color: 'text.secondary',
        fontFamily: 'monospace',
      }}
    >
      {format(time, 'HH:mm:ss', { locale: ptBR })}
    </Typography>
  );
}
