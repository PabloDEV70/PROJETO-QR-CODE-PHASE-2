import { useState } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { EventNote, SwapVert } from '@mui/icons-material';
import type { RdoDetalheItem } from '@/types/rdo-types';
import { AtividadeCard } from '@/components/apontamento/atividade-card';

interface AtividadeTimelineProps {
  items: RdoDetalheItem[];
  onEdit?: (item: RdoDetalheItem) => void;
}

export function AtividadeTimeline({ items, onEdit }: AtividadeTimelineProps) {
  const [reverseOrder, setReverseOrder] = useState(true);

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <EventNote sx={{ fontSize: 36, color: 'text.disabled', mb: 0.5 }} />
        <Typography sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>
          Nenhuma atividade registrada
        </Typography>
      </Box>
    );
  }

  const sorted = [...items].sort((a, b) =>
    reverseOrder
      ? (b.HRINI ?? 0) - (a.HRINI ?? 0)
      : (a.HRINI ?? 0) - (b.HRINI ?? 0),
  );

  return (
    <Box>
      {/* Sort toggle bar */}
      <Box sx={{
        display: 'flex', justifyContent: 'flex-end',
        px: 0, py: 0.5,
      }}>
        <ButtonBase
          onClick={() => setReverseOrder((v) => !v)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            px: 0.75, py: 0.25, borderRadius: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <SwapVert sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography sx={{
            fontSize: '0.65rem', fontWeight: 600, color: 'text.disabled',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {reverseOrder ? 'Recente primeiro' : 'Cronologico'}
          </Typography>
        </ButtonBase>
      </Box>

      {/* Items */}
      {sorted.map((item) => (
        <AtividadeCard
          key={`${item.CODRDO}-${item.ITEM}`}
          item={item}
          onClick={onEdit ? () => onEdit(item) : undefined}
        />
      ))}
    </Box>
  );
}
