import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBack, Edit } from '@mui/icons-material';
import { SituacaoForm } from '@/components/situacoes/situacao-form';
import { useHstVeiDetail } from '@/hooks/use-hstvei-detail';
import { useAtualizarSituacao } from '@/hooks/use-hstvei-mutations';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

export function SituacaoEditPage() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const navigate = useNavigate();
  const { data: detail, isLoading } = useHstVeiDetail(numId);
  const atualizar = useAtualizarSituacao();

  if (isLoading) return <LoadingSkeleton />;
  if (!detail) return <Typography>Situacao nao encontrada</Typography>;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBack />
        </IconButton>
        <Edit sx={{ color: 'primary.main' }} />
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>Editar Situacao</Typography>
          <Typography variant="caption" color="text.secondary">
            {detail.placa} — {detail.situacaoDescricao}
          </Typography>
        </Box>
      </Box>
      <SituacaoForm
        initialValues={{
          codveiculo: detail.CODVEICULO,
          idsit: detail.IDSIT,
          idpri: detail.IDPRI ?? undefined,
          descricao: detail.DESCRICAO ?? undefined,
          obs: detail.OBS ?? undefined,
          dtinicio: detail.DTINICIO ?? undefined,
          dtprevisao: detail.DTPREVISAO ?? undefined,
          dtfim: detail.DTFIM ?? undefined,
          nuos: detail.NUOS ?? undefined,
          numos: detail.NUMOS ?? undefined,
          nunota: detail.NUNOTA ?? undefined,
          codparc: detail.CODPARC ?? undefined,
          exeope: detail.EXEOPE ?? undefined,
          exemec: detail.EXEMEC ?? undefined,
        }}
        disableVeiculo
        onSubmit={(values) => {
          const { codveiculo: _, ...payload } = values;
          atualizar.mutate({ id: numId, payload }, { onSuccess: () => navigate(-1) });
        }}
        loading={atualizar.isPending}
      />
    </>
  );
}
