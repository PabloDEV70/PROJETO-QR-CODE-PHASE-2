import { useState, useMemo, useCallback } from 'react';
import {
  Paper, Typography, Stack, Box, LinearProgress, IconButton,
  Skeleton, Chip, Tooltip, useTheme,
} from '@mui/material';
import { ChevronRight, ArrowUpward, ArrowDownward, StarBorder, Star } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { useFavoritosStore } from '@/stores/favoritos-store';
import type { RdoAnalyticsProdutividade } from '@/types/rdo-analytics-types';

interface Props {
  produtividade?: RdoAnalyticsProdutividade[];
  isLoading: boolean;
  onColaboradorClick: (codparc: number) => void;
}

type SortKey = 'totalHoras' | 'percentualComOs' | 'nomeparc';

function statusIcon(pct: number): { label: string; color: string } {
  if (pct >= 90) return { label: 'Otimo', color: '#16A34A' };
  if (pct >= 70) return { label: 'Bom', color: '#F59E0B' };
  return { label: 'Atencao', color: '#d32f2f' };
}

export function RdoColaboradorRanking({ produtividade, isLoading, onColaboradorClick }: Props) {
  const theme = useTheme();
  const { toggle: toggleFav, isFavorito } = useFavoritosStore();
  const [sortKey, setSortKey] = useState<SortKey>('totalHoras');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }, [sortKey]);

  const sorted = useMemo(() => {
    if (!produtividade?.length) return [];
    const list = [...produtividade];
    list.sort((a, b) => {
      const av = sortKey === 'nomeparc' ? a.nomeparc : a[sortKey];
      const bv = sortKey === 'nomeparc' ? b.nomeparc : b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const diff = (Number(av) || 0) - (Number(bv) || 0);
      return sortDir === 'asc' ? diff : -diff;
    });
    return list;
  }, [produtividade, sortKey, sortDir]);

  const maxHoras = useMemo(
    () => sorted.reduce((m, p) => Math.max(m, p.totalHoras), 0),
    [sorted],
  );

  if (isLoading) {
    return <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2.5 }} />;
  }
  if (sorted.length === 0) return null;

  const SortIcon = sortDir === 'asc' ? ArrowUpward : ArrowDownward;
  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <Chip
      size="small" label={label} variant={sortKey === k ? 'filled' : 'outlined'}
      onClick={() => handleSort(k)}
      icon={sortKey === k ? <SortIcon sx={{ fontSize: 14 }} /> : undefined}
      sx={{ cursor: 'pointer', fontSize: 11, height: 24 }}
    />
  );

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Ranking Colaboradores ({sorted.length})
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <SortBtn k="totalHoras" label="Horas" />
          <SortBtn k="percentualComOs" label="% OS" />
          <SortBtn k="nomeparc" label="Nome" />
        </Stack>
      </Stack>

      <Stack spacing={0.75}>
        {sorted.map((p, i) => {
          const barPct = maxHoras > 0 ? (p.totalHoras / maxHoras) * 100 : 0;
          const st = statusIcon(p.percentualComOs);
          return (
            <Box
              key={p.codparc}
              onClick={() => onColaboradorClick(p.codparc)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1,
                borderRadius: 2, cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                transition: 'background-color 0.15s',
              }}
            >
              <Typography
                sx={{ width: 22, fontSize: 12, fontWeight: 700, color: 'text.secondary' }}
              >
                {i + 1}
              </Typography>
              <FuncionarioAvatar codparc={p.codparc} nome={p.nomeparc} size="small" />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {p.nomeparc}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {p.cargo || p.departamento || '-'}
                </Typography>
              </Box>
              <Box sx={{ width: 120 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="body2" fontWeight={700} sx={{ width: 40, textAlign: 'right' }}>
                    {p.totalHoras.toFixed(1)}h
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate" value={barPct}
                      sx={{
                        height: 6, borderRadius: 3,
                        bgcolor: theme.palette.action.hover,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: st.color, borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
              <Tooltip title={`${st.label} — OS: ${p.percentualComOs.toFixed(0)}%`} arrow>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: st.color, width: 38, textAlign: 'center' }}>
                  {p.percentualComOs.toFixed(0)}%
                </Typography>
              </Tooltip>
              <IconButton size="small" sx={{ p: 0.25 }}
                onClick={(e) => { e.stopPropagation(); toggleFav(p.codparc); }}>
                {isFavorito(p.codparc)
                  ? <Star sx={{ fontSize: 16, color: '#F59E0B' }} />
                  : <StarBorder sx={{ fontSize: 16 }} />}
              </IconButton>
              <IconButton size="small" sx={{ p: 0.25 }}>
                <ChevronRight sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
