import { useState } from 'react';
import { Box, Typography, Chip, Alert, AlertTitle } from '@mui/material';
import { FiberManualRecord } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { EmTempoRealKpis } from '@/components/em-tempo-real/em-tempo-real-kpis';
import { EmTempoRealStatusBar } from '@/components/em-tempo-real/em-tempo-real-status-bar';
import { EmTempoRealTable } from '@/components/em-tempo-real/em-tempo-real-table';
import { NotaDetalheDrawer } from '@/components/em-tempo-real/nota-detalhe-drawer';
import {
  useEmTempoRealMovimentacoes,
  useEmTempoRealResumo,
} from '@/hooks/use-em-tempo-real';

export function EmTempoRealPage() {
  const [drawerNunota, setDrawerNunota] = useState<number | null>(null);

  const {
    data: movimentacoes,
    isLoading: isLoadingMov,
    error: errorMov,
    dataUpdatedAt,
  } = useEmTempoRealMovimentacoes();

  const {
    data: resumo,
    isLoading: isLoadingResumo,
  } = useEmTempoRealResumo();

  const lastUpdate = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('pt-BR')
    : '-';

  return (
    <PageLayout
      title="Em Tempo Real"
      subtitle="Movimentacoes de notas e documentos"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<FiberManualRecord sx={{ fontSize: 12 }} />}
            label="Atualizacao automatica a cada 15s"
            color="success"
            size="small"
            variant="outlined"
          />
          <Typography variant="caption" color="text.secondary">
            Ultima atualizacao: {lastUpdate}
          </Typography>
        </Box>

        {errorMov && (
          <Alert severity="error">
            <AlertTitle>Erro ao carregar dados</AlertTitle>
            {errorMov instanceof Error ? errorMov.message : 'Erro desconhecido'}
          </Alert>
        )}

        <EmTempoRealKpis resumo={resumo} isLoading={isLoadingResumo} />

        <EmTempoRealStatusBar resumo={resumo} />

        <EmTempoRealTable
          data={movimentacoes ?? []}
          isLoading={isLoadingMov}
          onRowClick={(nunota) => setDrawerNunota(nunota)}
        />
      </Box>

      <NotaDetalheDrawer
        open={drawerNunota !== null}
        onClose={() => setDrawerNunota(null)}
        nunota={drawerNunota}
      />
    </PageLayout>
  );
}
