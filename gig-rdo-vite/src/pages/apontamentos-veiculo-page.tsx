import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Stack, Typography, Paper, Skeleton } from '@mui/material';
import { Timeline } from '@mui/icons-material';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { PageLayout } from '@/components/layout/page-layout';
import { TimelineDataGrid } from '@/components/apontamentos/timeline-data-grid';
import { useApontamentosTimeline, useApontamentosByVeiculo } from '@/hooks/use-apontamentos';

export function ApontamentosVeiculoPage() {
  const { codveiculo } = useParams<{ codveiculo: string }>();
  const codv = codveiculo ? Number(codveiculo) : undefined;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const veiculoQuery = useApontamentosByVeiculo(codv);
  const timelineQuery = useApontamentosTimeline(codv, { page, limit: pageSize });

  const veiculo = veiculoQuery.data?.[0];

  const handlePageChange = useCallback((model: GridPaginationModel) => {
    setPage(model.page + 1);
    setPageSize(model.pageSize);
  }, []);

  return (
    <PageLayout
      title={`Timeline Veiculo ${codveiculo ?? ''}`}
      subtitle="Historico cronologico de servicos apontados para este veiculo"
      icon={Timeline}
    >
      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          {veiculoQuery.isLoading ? (
            <Skeleton width={300} height={24} />
          ) : veiculo ? (
            <Stack direction="row" spacing={3}>
              <Typography variant="body2">
                <strong>Placa:</strong> {veiculo.PLACA ?? '-'}
              </Typography>
              <Typography variant="body2">
                <strong>Modelo:</strong> {veiculo.MARCAMODELO ?? '-'}
              </Typography>
              <Typography variant="body2">
                <strong>Tag:</strong> {veiculo.TAG ?? '-'}
              </Typography>
              <Typography variant="body2">
                <strong>Servicos:</strong> {veiculo.QTD_SERVICOS}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Veiculo nao encontrado
            </Typography>
          )}
        </Paper>

        <TimelineDataGrid
          rows={timelineQuery.data ?? []}
          total={veiculo?.QTD_SERVICOS ?? 0}
          page={page}
          pageSize={pageSize}
          isLoading={timelineQuery.isLoading}
          onPageChange={handlePageChange}
        />
      </Stack>
    </PageLayout>
  );
}
