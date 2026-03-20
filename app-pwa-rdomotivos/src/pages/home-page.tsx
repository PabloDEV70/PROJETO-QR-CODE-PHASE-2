import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Divider, Typography, alpha } from '@mui/material';
import { PlayArrow, Today, AccessTime, TrendingUp, History } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { getMotivosAtivos } from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';
import { useMeusRdos } from '@/hooks/use-meus-rdos';
import { useMinhasOs } from '@/hooks/use-minhas-os';
import { useRdoDia } from '@/hooks/use-rdo-dia';
import { useCreateRdo, useAddDetalhe, useUpdateDetalhe, useDeleteDetalhe, useSwitchDetalhe } from '@/hooks/use-rdo-mutations';
import { useAuthStore } from '@/stores/auth-store';
import { useEffectiveCodparc, useIsImpersonating } from '@/hooks/use-effective-codparc';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ApiErrorBanner } from '@/components/shared/api-error-banner';
import { ResumoDiaCard } from '@/components/apontamento/resumo-dia-card';
import { AtividadeTimeline } from '@/components/apontamento/atividade-timeline';
import { QuickActivityPicker } from '@/components/apontamento/quick-activity-picker';
import { ActiveActivityCard } from '@/components/apontamento/active-activity-card';
import { EditAtividadeSheet } from '@/components/apontamento/edit-atividade-sheet';
import { agoraHhmm, hhmmToString } from '@/utils/hora-utils';
import type { RdoDetalheItem, RdoMotivo, DetalheFormData } from '@/types/rdo-types';

/**
 * Detect the currently active (running) activity.
 *
 * An activity is "active" if it's the last one by HRINI AND its HRFIM
 * equals HRINI+1 (the sentinel value set at creation time).
 * Once HRFIM differs from HRINI+1, the activity has been explicitly stopped.
 *
 * manuallyStopped is a safety net for the brief window between the user
 * clicking STOP and the server-confirmed data arriving.
 */
function detectActiveItem(
  detalhes: RdoDetalheItem[],
  manuallyStopped: number | null,
): RdoDetalheItem | null {
  if (detalhes.length === 0) return null;
  const sorted = [...detalhes].sort((a, b) => (b.HRINI ?? 0) - (a.HRINI ?? 0));
  const last = sorted[0];
  if (!last || last.HRINI == null) return null;
  if (manuallyStopped === last.ITEM) return null;
  // Activity is only "running" if HRFIM is the sentinel (HRINI+1) or null
  const hrfim = last.HRFIM ?? last.hrfimFormatada;
  if (hrfim != null && hrfim !== last.HRINI + 1) return null;
  return last;
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
  return first!.charAt(0).toUpperCase() + first!.slice(1).toLowerCase();
}

function TodayContent({ codrdo }: { codrdo: number }) {
  const { cabecalho, detalhes, isLoading } = useRdoDia(codrdo);
  const addMut = useAddDetalhe();
  const updateMut = useUpdateDetalhe();
  const deleteMut = useDeleteDetalhe();
  const switchMut = useSwitchDetalhe();
  const [stoppedItem, setStoppedItem] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<RdoDetalheItem | null>(null);
  const codparc = useEffectiveCodparc();
  const { data: minhasOs, isLoading: osLoading } = useMinhasOs(codparc);

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
    updateMut.mutate({
      codrdo, item: activeItem.ITEM,
      data: { HRFIM: agoraHhmm() },
      label: 'Atividade parada',
    });
  }, [activeItem, codrdo, updateMut]);

  const handleEdit = (it: RdoDetalheItem) => setEditItem(it);

  const handleSaveEdit = useCallback((item: number, data: Partial<DetalheFormData>) => {
    updateMut.mutate({ codrdo, item, data });
  }, [codrdo, updateMut]);

  const handleDeleteEdit = useCallback((item: number) => {
    deleteMut.mutate({ codrdo, item });
  }, [codrdo, deleteMut]);

  if (isLoading) return <LoadingSkeleton message="Carregando..." />;
  if (!cabecalho) return null;

  const finalized = detalhes;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* SECAO 1: Atividade atual + Teclado */}
      <Box sx={{ mb: 1.5 }}>
        {hasActive ? (
          <ActiveActivityCard
            item={activeItem}
            motivos={motivos}
            onSwitch={switchActivity}
            onStop={stopActivity}
            lastNuos={cabecalho?.primeiroNuos}

            minhasOs={minhasOs}
            osLoading={osLoading}
          />
        ) : (
          <QuickActivityPicker
            motivos={motivos}
            onPick={startActivity}
            lastNuos={cabecalho?.primeiroNuos}

            minhasOs={minhasOs}
            osLoading={osLoading}
          />
        )}
      </Box>

      {/* SECAO 2: Desempenho do dia */}
      {detalhes.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          <Divider sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1 }}>
              <TrendingUp sx={{ fontSize: 16, color: 'text.disabled' }} />
              <Typography sx={{
                fontSize: '0.7rem', fontWeight: 700, color: 'text.disabled',
                textTransform: 'uppercase', letterSpacing: 2,
              }}>
                Desempenho
              </Typography>
            </Box>
          </Divider>
          <Box sx={{ mb: 0.5 }}>
            <ResumoDiaCard cabecalho={cabecalho} detalhes={detalhes} />
          </Box>
        </Box>
      )}

      {/* SECAO 3: Historico */}
      {finalized.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          <Divider sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1 }}>
              <History sx={{ fontSize: 16, color: 'text.disabled' }} />
              <Typography sx={{
                fontSize: '0.7rem', fontWeight: 700, color: 'text.disabled',
                textTransform: 'uppercase', letterSpacing: 2,
              }}>
                Historico
              </Typography>
              <Box sx={{
                px: 0.6, py: 0.1, borderRadius: 99,
                bgcolor: 'primary.main', color: '#fff',
                fontSize: '0.65rem', fontWeight: 700, lineHeight: 1.4,
                minWidth: 18, textAlign: 'center',
              }}>
                {finalized.length}
              </Box>
            </Box>
          </Divider>
          <AtividadeTimeline items={finalized} onEdit={handleEdit} />
        </Box>
      )}

      <EditAtividadeSheet
        open={editItem != null}
        item={editItem}
        motivos={motivos}
        onSave={handleSaveEdit}
        onDelete={handleDeleteEdit}
        onClose={() => setEditItem(null)}
      />
    </Box>
  );
}

export function HomePage() {
  const today = new Date();
  const dateStr = format(today, 'yyyy-MM-dd');
  const codparc = useEffectiveCodparc();
  const user = useAuthStore((s) => s.user);
  const impersonating = useAuthStore((s) => s.impersonating);
  const isImpersonating = useIsImpersonating();
  const { data, isLoading, error, refetch } = useMeusRdos({ dataInicio: dateStr, dataFim: dateStr });
  const createRdo = useCreateRdo();

  const todayLabel = format(today, "EEEE, dd 'de' MMMM", { locale: ptBR });
  const rdoHoje = data?.data?.[0];
  const greeting = getGreeting();
  const displayName = isImpersonating ? impersonating!.nome : user?.nome;
  const firstName = getFirstName(displayName);
  const horaAtual = hhmmToString(agoraHhmm());

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header — compact */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        {isImpersonating ? (
          <FuncionarioAvatar
            codparc={impersonating!.codparc}
            nome={impersonating!.nome}
            size="medium"
            sx={{ width: 36, height: 36 }}
          />
        ) : (
          <Today sx={{ fontSize: 30, color: 'primary.main' }} />
        )}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.3, color: 'text.primary' }}>
            {greeting}{firstName ? `, ${firstName}` : ''}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', textTransform: 'capitalize', fontWeight: 500 }}>
              {todayLabel}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <AccessTime sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography sx={{ fontSize: '0.8rem', color: 'text.disabled', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
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
