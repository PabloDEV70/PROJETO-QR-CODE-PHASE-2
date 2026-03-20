import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Divider, Typography, alpha } from '@mui/material';
import { PlayArrow, Today, AccessTime, TrendingUp, History } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { getMotivosAtivos } from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';
import { useMeusRdos } from '@/hooks/use-meus-rdos';
import { useRdoDia } from '@/hooks/use-rdo-dia';
import { useCreateRdo, useAddDetalhe, useUpdateDetalhe, useSwitchDetalhe } from '@/hooks/use-rdo-mutations';
import { useEffectiveCodparc } from '@/hooks/use-effective-codparc';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ApiErrorBanner } from '@/components/shared/api-error-banner';
import { ResumoDiaCard } from '@/components/apontamento/resumo-dia-card';
import { AtividadeTimeline } from '@/components/apontamento/atividade-timeline';
import { QuickActivityPicker } from '@/components/apontamento/quick-activity-picker';
import { ActiveActivityCard } from '@/components/apontamento/active-activity-card';
import { agoraHhmm, hhmmToString } from '@/utils/hora-utils';
import type { RdoDetalheItem, RdoMotivo, DetalheFormData } from '@/types/rdo-types';

function detectActiveItem(
  detalhes: RdoDetalheItem[],
  manuallyStopped: number | null,
): RdoDetalheItem | null {
  if (detalhes.length === 0) return null;
  const now = agoraHhmm();
  const sorted = [...detalhes].sort((a, b) => (b.HRINI ?? 0) - (a.HRINI ?? 0));
  const last = sorted[0];
  if (!last || last.HRINI == null || last.HRFIM == null) return null;
  if (manuallyStopped === last.ITEM) return null;
  const diff = last.HRFIM - last.HRINI;
  if (diff <= 2 || last.HRFIM > now) return last;
  return null;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getFirstName(nome: string | undefined): string {
  if (!nome) return '';
  const parts = nome.split(' ');
  const first = parts[0];
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

function TodayContent({ codrdo }: { codrdo: number }) {
  const navigate = useNavigate();
  const { cabecalho, detalhes, isLoading } = useRdoDia(codrdo);
  const addMut = useAddDetalhe();
  const updateMut = useUpdateDetalhe();
  const switchMut = useSwitchDetalhe();
  const [stoppedItem, setStoppedItem] = useState<number | null>(null);

  const { data: motivos = [] } = useQuery({
    queryKey: ['motivos-ativos'],
    queryFn: getMotivosAtivos,
    ...CACHE_TIMES.motivos,
  });

  const activeItem = useMemo(
    () => detectActiveItem(detalhes, stoppedItem),
    [detalhes, stoppedItem],
  );
  const hasActive = activeItem != null;

  useEffect(() => {
    sessionStorage.setItem('active-activity', hasActive ? 'true' : 'false');
    return () => sessionStorage.removeItem('active-activity');
  }, [hasActive]);

  const startActivity = useCallback((motivo: RdoMotivo, extra?: Partial<DetalheFormData>) => {
    setStoppedItem(null);
    const now = agoraHhmm();
    addMut.mutate({
      codrdo,
      data: { HRINI: now, HRFIM: now + 1, RDOMOTIVOCOD: motivo.RDOMOTIVOCOD, ...extra },
      motivo,
    });
  }, [codrdo, addMut]);

  const switchActivity = useCallback((motivo: RdoMotivo, extra?: Partial<DetalheFormData>) => {
    if (!activeItem) return;
    setStoppedItem(null);
    const now = agoraHhmm();
    // Atomic switch: single optimistic cache write + parallel API calls
    switchMut.mutate({
      codrdo,
      closeItem: activeItem.ITEM,
      closeData: { HRFIM: now },
      newData: { HRINI: now, HRFIM: now + 1, RDOMOTIVOCOD: motivo.RDOMOTIVOCOD, ...extra },
      motivo,
    });
  }, [activeItem, codrdo, switchMut]);

  const stopActivity = useCallback(() => {
    if (!activeItem) return;
    setStoppedItem(activeItem.ITEM);
    updateMut.mutate({ codrdo, item: activeItem.ITEM, data: { HRFIM: agoraHhmm() } });
  }, [activeItem, codrdo, updateMut]);

  const handleEdit = (item: RdoDetalheItem) => {
    navigate(`/atividade-form?codrdo=${codrdo}&item=${item.ITEM}`);
  };

  if (isLoading) return <LoadingSkeleton message="Carregando..." />;
  if (!cabecalho) return null;

  // All activities — active item included in timeline (shown first by sort)
  const finalized = detalhes;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* ═══ SEÇÃO 1: Atividade atual + Teclado ═══ */}
      <Box sx={{ mb: 2 }}>
        {hasActive ? (
          <ActiveActivityCard
            item={activeItem}
            motivos={motivos}
            onSwitch={switchActivity}
            onStop={stopActivity}
            lastNuos={cabecalho?.primeiroNuos}
            lastPlaca={cabecalho?.veiculoPlaca}
          />
        ) : (
          <QuickActivityPicker
            motivos={motivos}
            onPick={startActivity}
            lastNuos={cabecalho?.primeiroNuos}
            lastPlaca={cabecalho?.veiculoPlaca}
          />
        )}
      </Box>

      {/* ═══ SEÇÃO 2: Desempenho do dia ═══ */}
      {detalhes.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Divider sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5 }}>
              <TrendingUp sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography sx={{
                fontSize: '0.85rem', fontWeight: 700, color: 'text.secondary',
                textTransform: 'uppercase', letterSpacing: 1.5,
              }}>
                Desempenho
              </Typography>
            </Box>
          </Divider>
          <Box sx={{ mb: 1 }}>
            <ResumoDiaCard cabecalho={cabecalho} detalhes={detalhes} />
          </Box>
        </Box>
      )}

      {/* ═══ SEÇÃO 3: Historico ═══ */}
      {finalized.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Divider sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5 }}>
              <History sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography sx={{
                fontSize: '0.85rem', fontWeight: 700, color: 'text.secondary',
                textTransform: 'uppercase', letterSpacing: 1.5,
              }}>
                Historico
              </Typography>
              <Box sx={{
                px: 0.75, py: 0.15, borderRadius: 99, ml: 0.25,
                bgcolor: 'primary.main', color: '#fff',
                fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.4,
                minWidth: 22, textAlign: 'center',
              }}>
                {finalized.length}
              </Box>
            </Box>
          </Divider>
          <AtividadeTimeline items={finalized} onEdit={handleEdit} />
        </Box>
      )}
    </Box>
  );
}

export function HomePage() {
  const today = new Date();
  const dateStr = format(today, 'yyyy-MM-dd');
  const codparc = useEffectiveCodparc();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error, refetch } = useMeusRdos({ dataInicio: dateStr, dataFim: dateStr });
  const createRdo = useCreateRdo();

  const todayLabel = format(today, "EEEE, dd 'de' MMMM", { locale: ptBR });
  const rdoHoje = data?.data?.[0];
  const greeting = getGreeting();
  const firstName = getFirstName(user?.nome);
  const horaAtual = hhmmToString(agoraHhmm());

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header with Icon — matching admin-visualizar-como-page style */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Today sx={{ fontSize: 36, color: 'primary.main' }} />
        <Box>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.3, color: 'text.primary' }}>
            {greeting}{firstName ? `, ${firstName}` : ''}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', textTransform: 'capitalize', fontWeight: 500 }}>
              {todayLabel}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <AccessTime sx={{ fontSize: 16, color: 'text.disabled' }} />
              <Typography sx={{ fontSize: '0.9rem', color: 'text.disabled', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                {horaAtual}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <ApiErrorBanner error={error} onRetry={refetch} context="HomePage" />

      {isLoading ? (
        <LoadingSkeleton message="Carregando..." />
      ) : rdoHoje ? (
        <TodayContent codrdo={rdoHoje.CODRDO} />
      ) : (
        /* Empty state — welcoming, big CTA */
        <Box sx={{ mt: 6, textAlign: 'center', px: 2 }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PlayArrow sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, mb: 0.75, color: 'text.primary' }}>
            Nenhum RDO hoje
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 }}>
            Registre suas atividades do dia.{'\n'}
            Toque no botao abaixo para comecar.
          </Typography>
          <Button
            variant="contained"
            size="large"
            disableElevation
            startIcon={createRdo.isPending ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
            onClick={() => codparc && createRdo.mutate({ CODPARC: codparc, DTREF: dateStr })}
            disabled={createRdo.isPending || !codparc}
            sx={{
              borderRadius: 3, textTransform: 'none', fontWeight: 800, px: 5, py: 1.75,
              fontSize: '1.1rem', letterSpacing: 0.5,
              boxShadow: (t) => `0 4px 14px ${alpha(t.palette.primary.main, 0.35)}`,
            }}
          >
            {createRdo.isPending ? 'Criando...' : 'Iniciar meu RDO'}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default HomePage;
