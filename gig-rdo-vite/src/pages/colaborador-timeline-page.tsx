import { useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Alert, Skeleton, Stack } from '@mui/material';
import { Timeline } from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import { PageLayout } from '@/components/layout/page-layout';
import { RdoColaboradorHeader } from '@/components/rdo/rdo-colaborador-header';
import { ColaboradorTimelineToolbar } from '@/components/colaborador/colaborador-timeline-toolbar';
import { ColaboradorTimelineKpis } from '@/components/colaborador/colaborador-timeline-kpis';
import { ColaboradorMetaResumo } from '@/components/colaborador/colaborador-meta-resumo';
import { ColaboradorTimelineGantt } from '@/components/colaborador/colaborador-timeline-gantt';
import { HoraExtraAlerta } from '@/components/colaborador/hora-extra-alerta';
import { useColaboradorTimeline } from '@/hooks/use-rdo-extra';
import { useFuncionarioPerfilSuper } from '@/hooks/use-funcionario';

function defaultStart() {
  return format(subDays(new Date(), 30), 'yyyy-MM-dd');
}

export function ColaboradorTimelinePage() {
  const { codparc: codparcStr } = useParams();
  const codparc = codparcStr ? Number(codparcStr) : null;
  const [searchParams, setSearchParams] = useSearchParams();

  const dataInicio = searchParams.get('dataInicio') || defaultStart();
  const dataFim = searchParams.get('dataFim') || format(new Date(), 'yyyy-MM-dd');

  const handleDateChange = useCallback(
    (updates: Record<string, string>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, val] of Object.entries(updates)) {
          next.set(key, val);
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const timeline = useColaboradorTimeline(codparc, { dataInicio, dataFim });
  const perfil = useFuncionarioPerfilSuper(codparc);
  const data = timeline.data;

  return (
    <PageLayout title="Timeline" icon={Timeline}>
      <ColaboradorTimelineToolbar
        codparc={codparc ?? 0}
        nomeparc={perfil.data?.nomeparc}
        dataInicio={dataInicio}
        dataFim={dataFim}
        onDateChange={handleDateChange}
      />

      {timeline.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar timeline
        </Alert>
      )}

      {timeline.isLoading && (
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="rectangular" height={300} />
        </Stack>
      )}

      {data && (
        <Stack spacing={3}>
          <RdoColaboradorHeader perfil={perfil.data} isLoading={perfil.isLoading} />

          <ColaboradorTimelineKpis
            resumo={data.resumoPeriodo}
            totalDias={data.periodo.totalDias}
            isLoading={false}
          />

          <HoraExtraAlerta
            dias={data.dias}
            resumoPeriodo={data.resumoPeriodo}
          />

          <ColaboradorMetaResumo
            cargaHoraria={data.cargaHoraria}
            resumoPeriodo={data.resumoPeriodo}
            totalDias={data.periodo.totalDias}
          />

          <ColaboradorTimelineGantt
            dias={data.dias}
            cargaHoraria={data.cargaHoraria}
          />
        </Stack>
      )}
    </PageLayout>
  );
}
