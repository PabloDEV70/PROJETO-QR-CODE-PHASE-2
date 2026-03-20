import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Grid } from '@mui/material';
import { RdoDetalheTable } from '@/components/rdo/rdo-detalhe-table';
import { RdoDatasheetGrid } from '@/components/rdo/rdo-datasheet-grid';
import { RdoColaboradorHeader } from '@/components/rdo/rdo-colaborador-header';
import { RdoJornadaCard } from '@/components/rdo/rdo-jornada-card';
import { RdoProdPie } from '@/components/rdo/rdo-prod-pie';
import { RdoToleranciasCard } from '@/components/rdo/rdo-tolerancias-card';
import { OsDetailDrawer } from '@/components/rdo/os-detail-drawer';
import { RdoDebugPanel } from '@/components/rdo/rdo-debug-panel';
import { RdoProdutividadeExplainer } from '@/components/rdo/rdo-produtividade-explainer';
import { useRdoDetail } from '@/hooks/use-rdo-detail';

export function RdoDetailPage() {
  const { codrdo } = useParams<{ codrdo: string }>();
  const codrdoNum = codrdo ? Number(codrdo) : null;
  const [osDrawerNuos, setOsDrawerNuos] = useState<number | null>(null);

  const {
    rdo, loadingRdo, errorRdo, detalhes, loadingDetalhes,
    metricas, loadingMetricas, perfil, loadingPerfil,
    horasEsperadas, esperadoRawH, jornadaMin, metaEfMin, tolRatio,
    esperadoAjustado, diagnostico,
  } = useRdoDetail(codrdoNum);

  if (errorRdo) {
    return <Alert severity="error">Erro ao carregar RDO {codrdo}</Alert>;
  }


  return (
    <Box>
      {!loadingRdo && !rdo && (
        <Alert severity="warning" sx={{ mb: 2 }}>RDO {codrdo} nao encontrado</Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <RdoColaboradorHeader perfil={perfil} isLoading={loadingPerfil}>
            {(loadingMetricas || metricas) && metricas && (
              <RdoProdPie metricas={metricas} isLoading={loadingMetricas} />
            )}
          </RdoColaboradorHeader>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <RdoJornadaCard metricas={metricas} isLoading={loadingMetricas} />
        </Grid>
      </Grid>

      {metricas && <RdoToleranciasCard metricas={metricas} />}
      {metricas && <RdoProdutividadeExplainer metricas={metricas} />}

      <RdoDetalheTable detalhes={detalhes || []} isLoading={loadingDetalhes}
        onOsClick={(nuos) => setOsDrawerNuos(nuos)} />
      <OsDetailDrawer open={osDrawerNuos !== null}
        onClose={() => setOsDrawerNuos(null)} nuos={osDrawerNuos} />

      <RdoDatasheetGrid detalhes={detalhes || []} />

      <RdoDebugPanel
        metricas={metricas} detalhes={detalhes} horasEsperadas={horasEsperadas}
        esperadoRawH={esperadoRawH} jornadaMin={jornadaMin} metaEfMin={metaEfMin}
        tolRatio={tolRatio} esperadoAjustado={esperadoAjustado} diagnostico={diagnostico}
      />
    </Box>
  );
}
