import { useParams } from 'react-router-dom';
import { Box, Typography, Alert, Grid } from '@mui/material';
import { useOsDetail } from '@/hooks/use-os-detail';
import { OsHeaderCard } from '@/components/os/os-header-card';
import { OsTimelineCard } from '@/components/os/os-timeline-card';
import { OsDetailServicosGrid } from '@/components/os/os-detail-servicos-grid';
import { OsObservacoesCard } from '@/components/os/os-observacoes-card';

export function OsDetailPage() {
  const { nuos } = useParams<{ nuos: string }>();
  const nuosNum = nuos ? Number(nuos) : null;

  const { data, isLoading, isError, error } = useOsDetail(nuosNum);

  if (isError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Erro ao carregar OS {nuos}: {error?.message || 'Erro desconhecido'}
        </Alert>
      </Box>
    );
  }

  if (!isLoading && !data) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">OS {nuos} nao encontrada</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Detalhe da OS
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <OsHeaderCard os={data} isLoading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <OsTimelineCard os={data} isLoading={isLoading} />
        </Grid>
      </Grid>

      <Box sx={{ mb: 2 }}>
        <OsDetailServicosGrid servicos={data?.servicos ?? []} isLoading={isLoading} />
      </Box>

      <OsObservacoesCard nuos={nuosNum} />
    </Box>
  );
}
