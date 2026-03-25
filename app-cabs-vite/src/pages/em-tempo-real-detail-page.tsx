import { useParams } from 'react-router-dom';
import { Box, Alert, Skeleton, Stack, Typography } from '@mui/material';
import { PageLayout } from '@/components/layout/page-layout';
import { useNotaDetalhe } from '@/hooks/use-em-tempo-real';
import { NotaDetalheCabTab } from '@/components/em-tempo-real/nota-detalhe-cab-tab';
import { NotaDetalheItensTab } from '@/components/em-tempo-real/nota-detalhe-itens-tab';
import { NotaDetalheTopTab } from '@/components/em-tempo-real/nota-detalhe-top-tab';
import { NotaDetalheVarTab } from '@/components/em-tempo-real/nota-detalhe-var-tab';

export function EmTempoRealDetailPage() {
  const { nunota } = useParams<{ nunota: string }>();
  const nunotaNum = nunota ? Number(nunota) : null;
  const { data, isLoading, isError, error } = useNotaDetalhe(nunotaNum);

  if (isError) {
    return (
      <PageLayout title="Detalhe da Nota">
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Erro ao carregar nota'}
        </Alert>
      </PageLayout>
    );
  }

  if (!isLoading && !data) {
    return (
      <PageLayout title="Detalhe da Nota">
        <Alert severity="warning">Nota {nunota} nao encontrada</Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Nota ${nunota}`}
      subtitle={data ? `TOP ${data.cabecalho.CODTIPOPER} - ${data.cabecalho.PARCEIRO_NOME ?? ''}` : ''}
    >
      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={100} />
          <Skeleton variant="rounded" height={200} />
          <Skeleton variant="rounded" height={150} />
        </Stack>
      ) : data && (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
          <Box sx={{ flex: '1 1 58%', minWidth: 0 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Cabecalho
                </Typography>
                <NotaDetalheCabTab cab={data.cabecalho} />
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Itens ({data.itens.length})
                </Typography>
                <NotaDetalheItensTab itens={data.itens} />
              </Box>
            </Stack>
          </Box>

          <Box sx={{ flex: '1 1 42%', minWidth: 0 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Configuracao TOP
                </Typography>
                <NotaDetalheTopTab top={data.top} />
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Historico de Variacoes ({data.variacoes.length})
                </Typography>
                <NotaDetalheVarTab variacoes={data.variacoes} />
              </Box>
            </Stack>
          </Box>
        </Box>
      )}
    </PageLayout>
  );
}
