import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useRdoDia } from '@/hooks/use-rdo-dia';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ApiErrorBanner } from '@/components/shared/api-error-banner';
import { ResumoDiaCard } from '@/components/apontamento/resumo-dia-card';
import { AtividadeTimeline } from '@/components/apontamento/atividade-timeline';

export function RdoDetailPage() {
  const { codrdo } = useParams<{ codrdo: string }>();
  const codrdoNum = Number(codrdo);
  const { cabecalho, detalhes, isLoading, error, refetch } = useRdoDia(codrdoNum);

  if (isLoading) return <LoadingSkeleton message="Carregando RDO..." />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <ApiErrorBanner error={error} onRetry={refetch} context="RdoDetail" />
      {cabecalho && (
        <>
          <Box>
            <Typography variant="h6" fontWeight={700}>RDO #{codrdoNum}</Typography>
            <Typography variant="body2" color="text.secondary">
              {cabecalho.nomeparc} — {cabecalho.DTREF}
            </Typography>
          </Box>
          <ResumoDiaCard cabecalho={cabecalho} detalhes={detalhes} />
          <AtividadeTimeline items={detalhes} />
        </>
      )}
    </Box>
  );
}

export default RdoDetailPage;
