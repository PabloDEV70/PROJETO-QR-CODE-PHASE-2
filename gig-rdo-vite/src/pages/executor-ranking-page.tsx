import { useState } from 'react';
import { Alert, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { useExecutorRanking } from '@/hooks/use-executor-ranking';
import { ExecutorRankingGrid } from '@/components/os/executor-ranking-grid';
import { ExecutorComparisonChart } from '@/components/os/executor-comparison-chart';

export function ExecutorRankingPage() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const { data, isLoading, error } = useExecutorRanking({ startDate, endDate });

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error instanceof Error ? error.message : 'Erro ao carregar ranking de executores'}
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h5" fontWeight={700}>
          Ranking de Executores
        </Typography>
        {data?.period && (
          <Typography variant="body2" color="text.secondary">
            Periodo: {data.period.startDate} a {data.period.endDate}
          </Typography>
        )}
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Data Inicial"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            size="small"
          />
          <TextField
            label="Data Final"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            size="small"
          />
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <ExecutorComparisonChart data={data?.data} isLoading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Ranking Completo
            </Typography>
            <ExecutorRankingGrid data={data?.data} isLoading={isLoading} />
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
