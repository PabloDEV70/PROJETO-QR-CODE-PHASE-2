import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useHistorico } from '@/hooks/use-hstvei-veiculo';
import { SituacaoCard } from '@/components/veiculos/situacao-card';
import { TimelineItem } from '@/components/veiculos/timeline-item';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { PainelVeiculo } from '@/types/hstvei-types';

interface Props {
  codveiculo: number;
  veiculo?: PainelVeiculo;
}

export function VeiculoSituacoesTab({ codveiculo, veiculo }: Props) {
  const [histPage, setHistPage] = useState(1);
  const { data: histData, isLoading: loadingHist } = useHistorico(codveiculo, histPage);

  return (
    <>
      {veiculo && (
        <>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Situacoes ativas ({veiculo.situacoesAtivas.length})
          </Typography>
          {veiculo.situacoesAtivas.map((s) => <SituacaoCard key={s.id} situacao={s} />)}
          {veiculo.situacoesAtivas.length === 0 && <EmptyState message="Nenhuma situacao ativa" />}
        </>
      )}

      <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Historico</Typography>
      {loadingHist ? <LoadingSkeleton /> : (
        <>
          {(histData?.historico ?? []).map((h) => <TimelineItem key={h.id} item={h} />)}
          {histData?.historico.length === 0 && <EmptyState message="Sem historico" />}
          {histData && histData.meta.totalRegistros > histData.meta.page * histData.meta.limit && (
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography
                sx={{ fontSize: '0.8rem', color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setHistPage((p) => p + 1)}
              >
                Carregar mais
              </Typography>
            </Box>
          )}
        </>
      )}
    </>
  );
}
