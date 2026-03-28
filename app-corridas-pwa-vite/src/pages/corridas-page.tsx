import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  alpha,
  Skeleton,
} from '@mui/material';
import { ListAlt } from '@mui/icons-material';
import { useMinhasCorridas } from '@/hooks/use-corridas';
import { CorridaCardRich } from '@/components/corrida/corrida-card-rich';
import { STATUS_COLORS } from '@/types/corrida';

type TabFilter = 'abertas' | 'andamento' | 'concluidas' | 'todas';

const TABS: { key: TabFilter; label: string; status: string | undefined; color: string }[] = [
  { key: 'abertas', label: 'Abertas', status: '0', color: STATUS_COLORS['0'] },
  { key: 'andamento', label: 'Andamento', status: '1', color: STATUS_COLORS['1'] },
  { key: 'concluidas', label: 'Concluidas', status: '2', color: STATUS_COLORS['2'] },
  { key: 'todas', label: 'Todas', status: undefined, color: '#757575' },
];

export function CorridasPage() {
  const [tab, setTab] = useState<TabFilter>('abertas');

  const currentTab = TABS.find((t) => t.key === tab)!;

  const { data, isLoading, isRefetching, refetch } = useMinhasCorridas({
    status: currentTab.status,
    limit: 50,
  });

  const corridas = data ?? [];

  const handlePullRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Corridas
        </Typography>
        {isRefetching && <CircularProgress size={20} />}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2.5, overflowX: 'auto', pb: 0.5 }}>
        {TABS.map((t) => {
          const isActive = tab === t.key;
          return (
            <Chip
              key={t.key}
              label={t.label}
              onClick={() => setTab(t.key)}
              sx={{
                fontWeight: 700,
                minHeight: 36,
                fontSize: '0.8rem',
                bgcolor: isActive ? alpha(t.color, 0.12) : 'transparent',
                color: isActive ? t.color : 'text.secondary',
                border: '1px solid',
                borderColor: isActive ? alpha(t.color, 0.3) : 'divider',
                '&:hover': {
                  bgcolor: alpha(t.color, 0.08),
                },
              }}
            />
          );
        })}
      </Stack>

      {isLoading ? (
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={120} />
          ))}
        </Stack>
      ) : corridas.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <ListAlt sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary" variant="body1" fontWeight={500}>
            Nenhuma corrida encontrada
          </Typography>
          <Typography color="text.disabled" variant="body2" sx={{ mt: 0.5 }}>
            Tente outro filtro ou aguarde novas corridas
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5} onTouchEnd={handlePullRefresh}>
          {corridas.map((c) => (
            <CorridaCardRich
              key={c.ID}
              corrida={c}
              showMotorista
              showSolicitante
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default CorridasPage;
