import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Avatar, Box, Button, IconButton, Paper, Typography, TextField } from '@mui/material';
import { ArrowBack, ChevronLeft, ChevronRight, Today } from '@mui/icons-material';
import { format, addDays, parseISO } from 'date-fns';
import { useSessionStore } from '@/stores/session-store';
import { useRdoDia } from '@/hooks/use-rdo-dia';
import { useMotivos } from '@/hooks/use-motivos';
import { useRdoMutations } from '@/hooks/use-rdo-mutations';
import { agoraHhmm } from '@/utils/hora-utils';
import { getFotoUrl } from '@/api/funcionarios';
import { ActiveActivity } from '@/components/apontamento/active-activity';
import { ConfirmDialog } from '@/components/apontamento/confirm-dialog';
import { StopDialog } from '@/components/apontamento/stop-dialog';
import { SwitchConfirmDialog } from '@/components/apontamento/switch-confirm-dialog';
import { ResumoDia } from '@/components/apontamento/resumo-dia';
import { MotivoGrid } from '@/components/apontamento/motivo-grid';
import { OsPanel } from '@/components/apontamento/os-panel';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import type { RdoMotivo, DetalheFormData } from '@/types/rdo-types';

export function ApontamentoPage() {
  const { codparc } = useParams<{ codparc: string }>();
  const codparcNum = Number(codparc);
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const hoje = format(new Date(), 'yyyy-MM-dd');
  const dtref = sp.get('data') || hoje;

  const setDtref = (d: string) => {
    const next = new URLSearchParams(sp);
    if (d === hoje) next.delete('data'); else next.set('data', d);
    setSp(next, { replace: true });
  };

  const { activeNome, endSession } = useSessionStore();
  const { codrdo, detalhes, metricas, atividadeAtiva, isLoading, isToday } = useRdoDia(codparcNum, dtref);
  const { data: motivos } = useMotivos();

  // Multiuser: after any successful action, end session and go home
  const handleDone = () => {
    console.log('[tabman] handleDone — redirecting to home');
    endSession();
    setTimeout(() => navigate('/', { replace: true }), 500);
  };

  const mutations = useRdoMutations(codparcNum, { onDone: handleDone });
  const [confirmMotivo, setConfirmMotivo] = useState<RdoMotivo | null>(null);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const lastOsRef = useRef<{ NUOS: number; AD_SEQUENCIA_OS: number | null } | null>(null);

  // Track last OS context for quick-resume
  useEffect(() => {
    if (atividadeAtiva?.NUOS) {
      lastOsRef.current = { NUOS: atividadeAtiva.NUOS, AD_SEQUENCIA_OS: atividadeAtiva.AD_SEQUENCIA_OS };
    }
  }, [atividadeAtiva]);

  useEffect(() => { if (!activeNome) navigate('/', { replace: true }); }, [activeNome, navigate]);
  // Auto-create RDO only for today
  useEffect(() => { if (!isLoading && !codrdo && isToday) mutations.ensureRdo(dtref).catch(() => {}); }, [isLoading, codrdo, isToday]); // eslint-disable-line

  const [creatingRdo, setCreatingRdo] = useState(false);
  const handleCreateRdo = async () => {
    setCreatingRdo(true);
    try { await mutations.ensureRdo(dtref); } finally { setCreatingRdo(false); }
  };

  const [switchMotivo, setSwitchMotivo] = useState<RdoMotivo | null>(null);

  const handlePickMotivo = (motivo: RdoMotivo) => {
    // Productive → always open ConfirmDialog (OS/service selection)
    if (motivo.PRODUTIVO === 'S') { setConfirmMotivo(motivo); return; }
    // Non-productive: if already active, confirm before switching
    if (atividadeAtiva && codrdo) { setSwitchMotivo(motivo); return; }
    // No active activity → start directly
    mutations.startActivity.mutate({ HRINI: agoraHhmm(), HRFIM: agoraHhmm() + 1, RDOMOTIVOCOD: motivo.RDOMOTIVOCOD });
  };

  const handleSwitchConfirm = () => {
    if (!switchMotivo || !atividadeAtiva || !codrdo) return;
    const form: DetalheFormData = { HRINI: agoraHhmm(), HRFIM: agoraHhmm() + 1, RDOMOTIVOCOD: switchMotivo.RDOMOTIVOCOD };
    setSwitchMotivo(null);
    mutations.switchActivity.mutate({ codrdo, currentItem: atividadeAtiva.ITEM, form });
    // onDone (redirect) is called by switchActivity.onSuccess in use-rdo-mutations
  };

  const [pendingSwitch, setPendingSwitch] = useState<DetalheFormData | null>(null);

  const handleConfirm = (form: DetalheFormData) => {
    // If switching away from an OS+Service to a DIFFERENT service, ask to finish old one
    if (atividadeAtiva && codrdo && atividadeAtiva.NUOS && atividadeAtiva.AD_SEQUENCIA_OS) {
      const sameService = form.NUOS === atividadeAtiva.NUOS && form.AD_SEQUENCIA_OS === atividadeAtiva.AD_SEQUENCIA_OS;
      if (!sameService) {
        setPendingSwitch(form);
        setConfirmMotivo(null);
        setShowStopDialog(true);
        return;
      }
    }
    executeSwitch(form);
  };

  const executeSwitch = (form: DetalheFormData) => {
    if (atividadeAtiva && codrdo) {
      mutations.switchActivity.mutate({ codrdo, currentItem: atividadeAtiva.ITEM, form });
    } else {
      mutations.startActivity.mutate(form);
    }
    setConfirmMotivo(null);
  };

  const handleStop = () => {
    if (!atividadeAtiva || !codrdo) return;
    // If working on OS+Service, ask whether to pause or finish
    if (atividadeAtiva.NUOS && atividadeAtiva.AD_SEQUENCIA_OS) {
      setShowStopDialog(true);
      return;
    }
    mutations.stopActivity.mutate({ codrdo, item: atividadeAtiva.ITEM });
  };

  const handleStopPauseOnly = () => {
    const switchForm = pendingSwitch;
    setPendingSwitch(null);
    setShowStopDialog(false);
    if (switchForm) {
      executeSwitch(switchForm);
    } else if (atividadeAtiva && codrdo) {
      mutations.stopActivity.mutate({ codrdo, item: atividadeAtiva.ITEM });
    }
  };

  const handleStopAndFinish = () => {
    const switchForm = pendingSwitch;
    setPendingSwitch(null);
    setShowStopDialog(false);
    if (switchForm) {
      // Finish old service, then start new — startActivity.onSuccess will handle redirect
      if (atividadeAtiva && codrdo && atividadeAtiva.NUOS && atividadeAtiva.AD_SEQUENCIA_OS) {
        mutations.finishServico.mutate(
          { codrdo, nuos: atividadeAtiva.NUOS, sequencia: atividadeAtiva.AD_SEQUENCIA_OS },
          { onSuccess: () => mutations.startActivity.mutate(switchForm) },  // chain → startActivity.onDone redirects
        );
      }
    } else {
      handleFinishServico();
    }
  };

  const handleFinishServico = () => {
    if (atividadeAtiva && codrdo && atividadeAtiva.NUOS && atividadeAtiva.AD_SEQUENCIA_OS) {
      mutations.finishServico.mutate({
        codrdo,
        nuos: atividadeAtiva.NUOS,
        sequencia: atividadeAtiva.AD_SEQUENCIA_OS,
      });
    }
  };

  const handleBack = () => { endSession(); navigate('/', { replace: true }); };

  if (isLoading) return <LoadingSkeleton />;

  const isBusy = mutations.startActivity.isPending || mutations.switchActivity.isPending || mutations.finishServico.isPending;

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 68px)', overflow: 'hidden', gap: 1 }}>

      {/* ══ LEFT: main content ══ */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, overflow: 'hidden' }}>

        {/* Colaborador + Produtividade */}
        <Paper sx={{ p: 1.25, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={handleBack} size="small">
              <ArrowBack sx={{ fontSize: 18 }} />
            </IconButton>
            <Avatar src={getFotoUrl(codparcNum)} sx={{ width: 40, height: 40 }}>
              {activeNome?.charAt(0)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.2 }} noWrap>{activeNome}</Typography>
              <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.55rem', color: 'text.disabled' }}>
                #{codparcNum}
              </Typography>
            </Box>

            {/* RDO status badge */}
            <Box
              onClick={codrdo ? undefined : handleCreateRdo}
              sx={{
                px: 1, py: 0.4, borderRadius: 0.5, ml: 1, flexShrink: 0,
                bgcolor: codrdo ? '#e8f5e9' : '#fff3e0',
                border: '1px solid', borderColor: codrdo ? '#2e7d32' : '#e65100',
                cursor: codrdo ? 'default' : 'pointer',
                '&:hover': codrdo ? {} : { bgcolor: '#ffe0b2' },
              }}
            >
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: codrdo ? '#2e7d32' : '#e65100', lineHeight: 1 }}>
                {codrdo ? `RDO ${codrdo}` : creatingRdo ? 'Criando...' : '+ CRIAR RDO'}
              </Typography>
              <Typography sx={{ fontSize: '0.48rem', color: 'text.disabled', lineHeight: 1.2 }}>
                {codrdo ? 'editando' : 'clique para criar'}
              </Typography>
            </Box>

            {/* Date navigator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 'auto' }}>
              <IconButton size="small" onClick={() => setDtref(format(addDays(parseISO(dtref), -1), 'yyyy-MM-dd'))}>
                <ChevronLeft sx={{ fontSize: 18 }} />
              </IconButton>
              <TextField
                type="date" value={dtref} size="small"
                onChange={(e) => setDtref(e.target.value)}
                sx={{ width: 130, '& .MuiOutlinedInput-root': { height: 28, fontSize: '0.7rem' } }}
              />
              <IconButton size="small" onClick={() => setDtref(format(addDays(parseISO(dtref), 1), 'yyyy-MM-dd'))} disabled={dtref >= hoje}>
                <ChevronRight sx={{ fontSize: 18 }} />
              </IconButton>
              {!isToday && (
                <IconButton size="small" onClick={() => setDtref(hoje)} title="Hoje">
                  <Today sx={{ fontSize: 16, color: 'primary.main' }} />
                </IconButton>
              )}
            </Box>

            {metricas && (
              <Box sx={{ ml: 1 }}>
                <ResumoDia metricas={metricas} />
              </Box>
            )}
          </Box>
        </Paper>

        {/* Atividade ativa (today only) */}
        {isToday && atividadeAtiva && (
          <Paper sx={{ p: 0, overflow: 'hidden', flexShrink: 0 }}>
            <ActiveActivity key={atividadeAtiva.ITEM} detalhe={atividadeAtiva} onStop={handleStop} onFinishServico={handleFinishServico} isPending={mutations.stopActivity.isPending || mutations.finishServico.isPending} />
          </Paper>
        )}

        {/* Past date banner */}
        {!isToday && (
          <Paper sx={{ p: 1, flexShrink: 0, bgcolor: '#fff3e0', border: '1px solid #e65100', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#e65100' }}>
              {new Date(dtref + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </Typography>
            {!codrdo && (
              <Button
                variant="contained" size="small" disabled={creatingRdo}
                onClick={handleCreateRdo}
                sx={{ bgcolor: '#e65100', fontSize: '0.68rem', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#bf360c' } }}
              >
                {creatingRdo ? 'Criando...' : 'Criar RDO'}
              </Button>
            )}
          </Paper>
        )}

        {/* Detalhes list (past dates with RDO) */}
        {!isToday && codrdo && detalhes.length > 0 && (
          <Paper sx={{ p: 1, flexShrink: 0, maxHeight: 200, overflow: 'auto' }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, mb: 0.5 }}>{detalhes.length} atividades registradas</Typography>
            {detalhes.map((d) => (
              <Box key={d.ITEM} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, py: 0.4, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 600, width: 90, flexShrink: 0 }}>
                  {d.hriniFormatada} — {d.hrfimFormatada}
                </Typography>
                <Box sx={{ px: 0.5, py: 0.1, borderRadius: 0.4, flexShrink: 0, bgcolor: d.motivoProdutivo === 'S' ? '#2e7d32' : '#64748B', color: '#fff' }}>
                  <Typography sx={{ fontSize: '0.52rem', fontWeight: 700 }}>{d.motivoSigla}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', flex: 1, minWidth: 0 }} noWrap>{d.motivoDescricao}</Typography>
                {d.duracaoMinutos != null && d.duracaoMinutos > 0 && (
                  <Typography sx={{ fontSize: '0.55rem', color: 'text.disabled', fontFamily: 'monospace', flexShrink: 0 }}>{d.duracaoMinutos}min</Typography>
                )}
              </Box>
            ))}
          </Paper>
        )}

        {/* Motivos grid — shown when RDO exists (today or past) */}
        {codrdo && (
          <Paper sx={{ flex: 1, p: 1.5, overflow: 'auto', minHeight: 0 }}>
            {!isToday && !atividadeAtiva && (
              <Typography sx={{ fontSize: '0.68rem', color: '#e65100', fontWeight: 600, mb: 1 }}>
                Adicionando atividade para {new Date(dtref + 'T12:00:00').toLocaleDateString('pt-BR')}
              </Typography>
            )}
            {motivos && (
              <MotivoGrid
                motivos={motivos}
                onPick={handlePickMotivo}
                disabled={isBusy}
                hasActiveActivity={!!atividadeAtiva}
              />
            )}
          </Paper>
        )}

        {/* No RDO placeholder */}
        {!codrdo && !isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <Typography sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
              {isToday ? 'Criando RDO...' : 'Crie o RDO para adicionar atividades'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ══ RIGHT SIDEBAR: OS + Veiculos (full height) ══ */}
      <Paper sx={{ width: 300, flexShrink: 0, p: 1.5, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <OsPanel codparc={codparcNum} activeNuos={atividadeAtiva?.NUOS ?? null} activeSequencia={atividadeAtiva?.AD_SEQUENCIA_OS ?? null} />
      </Paper>

      {/* Confirm dialog */}
      {confirmMotivo && (
        <ConfirmDialog
          open={!!confirmMotivo}
          onClose={() => setConfirmMotivo(null)}
          motivo={confirmMotivo}
          codparc={codparcNum}
          isSwitch={!!atividadeAtiva}
          onConfirm={handleConfirm}
          isPending={isBusy}
          lastOs={lastOsRef.current}
        />
      )}

      {/* Switch confirm dialog (non-productive motivo) */}
      {switchMotivo && (
        <SwitchConfirmDialog
          open={!!switchMotivo}
          onClose={() => setSwitchMotivo(null)}
          motivo={switchMotivo}
          currentSigla={atividadeAtiva?.motivoSigla ?? null}
          onConfirm={handleSwitchConfirm}
          isPending={isBusy}
        />
      )}

      {/* Stop dialog — pause vs finish service */}
      {showStopDialog && atividadeAtiva?.NUOS && (
        <StopDialog
          open={showStopDialog}
          onClose={() => { setShowStopDialog(false); setPendingSwitch(null); }}
          servicoNome={atividadeAtiva.servicoNome}
          nuos={atividadeAtiva.NUOS}
          onPause={handleStopPauseOnly}
          onFinish={handleStopAndFinish}
          isPending={mutations.stopActivity.isPending || mutations.finishServico.isPending}
          isSwitching={!!pendingSwitch}
        />
      )}

      {/* Dialog removed — RDO creation is now one-click */}
    </Box>
  );
}
