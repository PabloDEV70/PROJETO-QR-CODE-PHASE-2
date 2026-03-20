import { useParams, useNavigate } from 'react-router-dom';
import { Box, Alert, Button, Grid, Paper, Typography, Skeleton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { ChamadoDetailCard } from '@/components/chamados/chamado-detail-card';
import { ChamadoTimeline } from '@/components/chamados/chamado-timeline';
import { AnexosList } from '@/components/shared/anexos-list';
import { useChamadoById, useChamadoOcorrencias, useChamadoAnexos } from '@/hooks/use-chamados';

export function ChamadoDetailPage() {
  const { nuchamado } = useParams<{ nuchamado: string }>();
  const navigate = useNavigate();
  const nuchamadoNum = nuchamado ? Number(nuchamado) : null;

  const detailQuery = useChamadoById(nuchamadoNum);
  const ocorrenciasQuery = useChamadoOcorrencias(nuchamadoNum);
  const anexosQuery = useChamadoAnexos(nuchamadoNum);

  if (detailQuery.isError) {
    return (
      <Box sx={{ p: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Voltar
        </Button>
        <Alert severity="error">
          Erro ao carregar chamado {nuchamado}: {detailQuery.error?.message ?? 'Erro desconhecido'}
        </Alert>
      </Box>
    );
  }

  if (!detailQuery.isLoading && !detailQuery.data) {
    return (
      <Box sx={{ p: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Voltar
        </Button>
        <Alert severity="warning">Chamado {nuchamado} nao encontrado.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Voltar para Chamados
      </Button>

      {detailQuery.isLoading ? (
        <Box>
          <Skeleton variant="rounded" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={150} />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            {detailQuery.data && <ChamadoDetailCard chamado={detailQuery.data} />}
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            {(anexosQuery.data?.length || anexosQuery.isLoading) && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                  Anexos ({anexosQuery.data?.length ?? 0})
                </Typography>
                <AnexosList
                  anexos={anexosQuery.data ?? []}
                  isLoading={anexosQuery.isLoading}
                />
              </Paper>
            )}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                Historico de Ocorrencias
              </Typography>
              <ChamadoTimeline
                ocorrencias={ocorrenciasQuery.data ?? []}
                isLoading={ocorrenciasQuery.isLoading}
              />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
