import { useState } from 'react';
import {
  Box, Typography, Stack, Chip, CircularProgress,
} from '@mui/material';
import { useMinhasCorridas } from '@/hooks/use-corridas';
import { CorridaCard } from '@/components/corrida/corrida-card';

type TabFilter = 'abertas' | 'concluidas' | 'todas';

const TAB_STATUS_MAP: Record<TabFilter, string | undefined> = {
  abertas: '0',
  concluidas: '2',
  todas: undefined,
};

export function MinhasCorridasPage() {
  const [tab, setTab] = useState<TabFilter>('abertas');

  const { data, isLoading, isRefetching } = useMinhasCorridas({
    role: 'solicitante',
    status: TAB_STATUS_MAP[tab],
    limit: 50,
  });

  const corridas = data?.data ?? [];

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Minhas Corridas
        </Typography>
        {isRefetching && <CircularProgress size={18} />}
      </Stack>

      <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
        {(['abertas', 'concluidas', 'todas'] as const).map((t) => (
          <Chip
            key={t}
            label={t.charAt(0).toUpperCase() + t.slice(1)}
            onClick={() => setTab(t)}
            variant={tab === t ? 'filled' : 'outlined'}
            color={tab === t ? 'primary' : 'default'}
            sx={{ fontWeight: tab === t ? 700 : 400, minHeight: 36 }}
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
        <Stack spacing={1}>
          {corridas.map((c) => (
            <CorridaCard
              key={c.ID}
              corrida={c}
              to={`/corrida/${c.ID}`}
              showMotorista
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
