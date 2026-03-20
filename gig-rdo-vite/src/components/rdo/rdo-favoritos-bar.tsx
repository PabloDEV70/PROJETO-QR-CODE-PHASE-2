import { useMemo } from 'react';
import { Paper, Stack, Chip, Typography, Tooltip, IconButton, Box } from '@mui/material';
import { Star, Close } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { useFavoritosStore } from '@/stores/favoritos-store';
import type { RdoAnalyticsProdutividade } from '@/types/rdo-analytics-types';

interface Props {
  produtividade?: RdoAnalyticsProdutividade[];
  onColaboradorClick: (codparc: number) => void;
}

export function RdoFavoritosBar({ produtividade, onColaboradorClick }: Props) {
  const { codparcs, toggle, clear } = useFavoritosStore();

  const favs = useMemo(() => {
    if (!produtividade?.length || codparcs.length === 0) return [];
    return codparcs
      .map((cp) => produtividade.find((p) => p.codparc === cp))
      .filter(Boolean) as RdoAnalyticsProdutividade[];
  }, [produtividade, codparcs]);

  if (favs.length === 0) return null;

  return (
    <Paper sx={{ px: 2, py: 1, borderRadius: 2.5, bgcolor: 'rgba(245,158,11,0.05)' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ overflow: 'auto' }}>
        <Star sx={{ fontSize: 18, color: '#F59E0B' }} />
        <Typography variant="caption" fontWeight={700} color="text.secondary" noWrap>
          Monitorando:
        </Typography>
        {favs.map((f) => (
          <Tooltip key={f.codparc} arrow
            title={`${f.totalHoras.toFixed(1)}h | OS: ${f.percentualComOs.toFixed(0)}%`}>
            <Chip
              size="small"
              avatar={<FuncionarioAvatar codparc={f.codparc} nome={f.nomeparc} size="small" />}
              label={f.nomeparc.split(' ')[0]}
              onClick={() => onColaboradorClick(f.codparc)}
              onDelete={() => toggle(f.codparc)}
              sx={{ fontWeight: 600, fontSize: 11, height: 28 }}
            />
          </Tooltip>
        ))}
        <Box sx={{ flex: 1 }} />
        {favs.length > 1 && (
          <IconButton size="small" onClick={clear}
            sx={{ p: 0.25, color: 'text.disabled' }}>
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Stack>
    </Paper>
  );
}
