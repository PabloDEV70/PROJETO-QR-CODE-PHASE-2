import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { MotivoButton } from './motivo-button';
import type { RdoMotivo } from '@/types/rdo-types';

interface MotivoGridProps {
  motivos: RdoMotivo[];
  onPick: (motivo: RdoMotivo) => void;
  disabled?: boolean;
  hasActiveActivity?: boolean;
}

export function MotivoGrid({ motivos, onPick, disabled, hasActiveActivity }: MotivoGridProps) {
  const sorted = useMemo(
    () => motivos.filter((m) => m.ATIVO === 'S').sort((a, b) => a.RDOMOTIVOCOD - b.RDOMOTIVOCOD),
    [motivos],
  );

  return (
    <Box>
      <Typography sx={{
        fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary',
        textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1,
      }}>
        {hasActiveActivity ? 'Trocar para' : 'Iniciar atividade'}
      </Typography>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 0.5,
      }}>
        {sorted.map((m) => (
          <MotivoButton key={m.RDOMOTIVOCOD} motivo={m} onPick={onPick} disabled={disabled} />
        ))}
      </Box>
    </Box>
  );
}
