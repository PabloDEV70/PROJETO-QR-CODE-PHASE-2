import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, IconButton, Typography, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery } from '@tanstack/react-query';
import { getMotivosAtivos } from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';
import { useRdoDia } from '@/hooks/use-rdo-dia';
import { useAddDetalhe, useUpdateDetalhe } from '@/hooks/use-rdo-mutations';
import { QuickActivityPicker } from '@/components/apontamento/quick-activity-picker';
import { agoraHhmm } from '@/utils/hora-utils';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import type { RdoMotivo } from '@/types/rdo-types';

export function EscolherAtividadePage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const codrdo = Number(sp.get('codrdo'));
  const activeItem = Number(sp.get('item')) || null; // ITEM da atividade ativa (para finalizar)

  const { detalhes, isLoading: rdoLoading } = useRdoDia(codrdo);
  const { data: motivos = [], isLoading: motivosLoading } = useQuery({
    queryKey: ['motivos-ativos'],
    queryFn: getMotivosAtivos,
    ...CACHE_TIMES.motivos,
  });

  const addMut = useAddDetalhe();
  const updateMut = useUpdateDetalhe();
  const isBusy = addMut.isPending || updateMut.isPending;

  const handlePick = (motivo: RdoMotivo) => {
    const now = agoraHhmm();

    if (activeItem) {
      // Finalizar atividade ativa e iniciar nova
      updateMut.mutate(
        { codrdo, item: activeItem, data: { HRFIM: now } },
        {
          onSuccess: () => {
            addMut.mutate(
              { codrdo, data: { HRINI: now, HRFIM: now + 1, RDOMOTIVOCOD: motivo.RDOMOTIVOCOD } },
              { onSuccess: () => navigate('/', { replace: true }) },
            );
          },
        },
      );
    } else {
      // Iniciar nova atividade
      addMut.mutate(
        { codrdo, data: { HRINI: now, HRFIM: now + 1, RDOMOTIVOCOD: motivo.RDOMOTIVOCOD } },
        { onSuccess: () => navigate('/', { replace: true }) },
      );
    }
  };

  // Filtrar motivo atual da lista
  const currentMotivoCod = activeItem
    ? detalhes.find((d) => d.ITEM === activeItem)?.RDOMOTIVOCOD
    : null;
  const filtered = currentMotivoCod
    ? motivos.filter((m) => m.RDOMOTIVOCOD !== currentMotivoCod)
    : motivos;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          {activeItem ? 'Trocar atividade' : 'Iniciar atividade'}
        </Typography>
      </Stack>

      {rdoLoading || motivosLoading ? (
        <LoadingSkeleton message="Carregando motivos..." />
      ) : (
        <QuickActivityPicker
          motivos={filtered}
          onPick={handlePick}
          disabled={isBusy}
          isLoading={false}
        />
      )}

      {isBusy && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
          Salvando...
        </Typography>
      )}
    </Box>
  );
}

export default EscolherAtividadePage;
