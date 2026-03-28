import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useMinhasCorridas } from '@/hooks/use-corridas';
import { CorridaCardRich } from '@/components/corrida/corrida-card-rich';

type TabFilter = 'abertas' | 'andamento' | 'concluidas' | 'todas';

const TABS: { key: TabFilter; label: string; status: string | undefined }[] = [
  { key: 'abertas', label: 'Abertas', status: '0' },
  { key: 'andamento', label: 'Andamento', status: '1' },
  { key: 'concluidas', label: 'Concluidas', status: '2' },
  { key: 'todas', label: 'Todas', status: undefined },
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
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>
          Corridas
        </Typography>
        {isRefetching && <CircularProgress size={18} />}
      </Stack>

      <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
        {TABS.map((t) => (
          <Chip
            key={t.key}
            label={t.label}
            onClick={() => setTab(t.key)}
            variant={tab === t.key ? 'filled' : 'outlined'}
            color={tab === t.key ? 'primary' : 'default'}
            sx={{ fontWeight: tab === t.key ? 700 : 400, minHeight: 36 }}
          />
        ))}
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : corridas.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography color="text.secondary" variant="body2">
            Nenhuma corrida encontrada
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1} onTouchEnd={handlePullRefresh}>
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
