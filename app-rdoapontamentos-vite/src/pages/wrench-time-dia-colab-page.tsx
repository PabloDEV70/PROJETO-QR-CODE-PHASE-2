import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { ArrowBack, BuildCircle } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { WtColabProfileHeader } from '@/components/wrench-time/wt-colab-profile-header';
import { WtColabJornadaBar } from '@/components/wrench-time/wt-colab-jornada-bar';
import { WtColabDayKpis } from '@/components/wrench-time/wt-colab-day-kpis';
import { WtColabMotivoBreakdown } from '@/components/wrench-time/wt-colab-motivo-breakdown';
import { WtColabAtividadesTable } from '@/components/wrench-time/wt-colab-atividades-table';
import { useColaboradorTimeline } from '@/hooks/use-rdo-extra';
import type { ColaboradorTimelineDia } from '@/types/rdo-timeline-types';

export function WrenchTimeDiaColabPage() {
  const { dtref, codparc: codparcStr } = useParams<{ dtref: string; codparc: string }>();
  const navigate = useNavigate();
  const codparc = Number(codparcStr) || null;

  const { data, isLoading, error } = useColaboradorTimeline(
    codparc, { dataInicio: dtref!, dataFim: dtref! },
  );

  const dia = useMemo<ColaboradorTimelineDia | null>(
    () => data?.dias?.[0] ?? null, [data],
  );
  const colab = data?.colaborador;

  if (!dtref || !codparc) {
    return (
      <PageLayout title="Wrench Time" icon={BuildCircle}>
        <Alert severity="warning">Parametros invalidos</Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Wrench Time — Detalhe Diario" icon={BuildCircle}>
      <Stack spacing={2.5}>
        <Button startIcon={<ArrowBack />} variant="text" size="small"
          onClick={() => navigate(-1)} sx={{ alignSelf: 'flex-start' }}>
          Voltar
        </Button>

        {error && <Alert severity="error">Erro ao carregar dados do colaborador</Alert>}

        {colab && dia && (
          <WtColabProfileHeader colab={colab} dia={dia} dtref={dtref} codparc={codparc} />
        )}

        {dia && <WtColabJornadaBar dia={dia} />}

        {dia && <WtColabDayKpis dia={dia} />}

        {dia && <WtColabMotivoBreakdown atividades={dia.atividades} />}

        {dia && <WtColabAtividadesTable atividades={dia.atividades} />}

        {isLoading && (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            Carregando...
          </Typography>
        )}
      </Stack>
    </PageLayout>
  );
}

export default WrenchTimeDiaColabPage;
