import { useState, useEffect, useCallback } from 'react';
import {
  Box, ButtonBase, SwipeableDrawer,
  Typography, alpha, darken, lighten,
} from '@mui/material';
import { Stop, FiberManualRecord, AccessTime, DirectionsCar, Build } from '@mui/icons-material';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import { getMotivoIconProd, getMotivoIcon } from '@/utils/motivo-icons';
import { hhmmToString, agoraHhmm, formatElapsedTimer } from '@/utils/hora-utils';
import { ConfirmActivitySheet } from '@/components/apontamento/confirm-activity-sheet';
import type { RdoDetalheItem, RdoMotivo, DetalheFormData } from '@/types/rdo-types';
import type { OsListItem } from '@/types/os-types';

interface ActiveActivityCardProps {
  item: RdoDetalheItem;
  onSwitch: (motivo: RdoMotivo, extra?: Partial<DetalheFormData>) => void;
  onStop: () => void;
  motivos: RdoMotivo[];
  lastNuos?: number | null;
  minhasOs?: OsListItem[];
  osLoading?: boolean;
}

const MONO = '"SF Mono", "Roboto Mono", "Fira Code", monospace';

function getCatColor(m: RdoMotivo): string {
  if (m.PRODUTIVO === 'S') return '#16A34A';
  if (m.WTCATEGORIA) return getCategoryMeta(m.WTCATEGORIA).color;
  return '#64748B';
}

/** Parse OBS: "Servico: Nome #COD | user obs" → { servico, servicoCod, obs } */
function parseObs(obs: string | null): { servico: string | null; servicoCod: string | null; obs: string | null } {
  if (!obs) return { servico: null, servicoCod: null, obs: null };
  const parts = obs.split(' | ');
  let servico: string | null = null;
  let servicoCod: string | null = null;
  const rest: string[] = [];
  for (const p of parts) {
    if (p.startsWith('Servico: ')) {
      const raw = p.slice('Servico: '.length);
      const codMatch = raw.match(/#(\d+)$/);
      if (codMatch) {
        servicoCod = codMatch[1]!;
        servico = raw.slice(0, raw.lastIndexOf('#')).trim();
      } else {
        servico = raw;
      }
    } else {
      rest.push(p);
    }
  }
  return { servico, servicoCod, obs: rest.length > 0 ? rest.join(' | ') : null };
}

function btnSx(c: string, isDark: boolean) {
  const face = isDark ? lighten(c, 0.05) : c;
  const topEdge = lighten(c, isDark ? 0.15 : 0.25);
  const bottomEdge = darken(c, 0.35);
  return {
    borderRadius: 2,
    background: `linear-gradient(180deg, ${lighten(face, 0.06)} 0%, ${face} 50%, ${darken(face, 0.06)} 100%)`,
    color: '#fff',
    boxShadow: [
      `0 3px 0 0 ${bottomEdge}`,
      `0 4px 8px 0 ${alpha(c, 0.2)}`,
      `inset 0 1px 0 0 ${alpha(topEdge, 0.4)}`,
    ].join(', '),
    border: `1px solid ${alpha(bottomEdge, 0.25)}`,
    '&:active': {
      transform: 'translateY(3px)',
      boxShadow: `0 0 0 0 ${bottomEdge}, inset 0 2px 3px ${alpha('#000', 0.15)}`,
    },
    transition: 'all 60ms ease-out',
  };
}

export function ActiveActivityCard({
  item, onSwitch, onStop, motivos, lastNuos, minhasOs, osLoading,
}: ActiveActivityCardProps) {
  const [elapsed, setElapsed] = useState('');
  const [switchMotivo, setSwitchMotivo] = useState<RdoMotivo | null>(null);
  const [stopSheetOpen, setStopSheetOpen] = useState(false);
  const isProd = item.motivoProdutivo === 'S';
  const accent = item.motivoCategoria
    ? getCategoryMeta(item.motivoCategoria).color
    : (isProd ? '#16A34A' : '#F59E0B');
  const Icon = isProd ? getMotivoIconProd(item.motivoSigla) : getMotivoIcon(item.motivoSigla);
  const parsed = parseObs(item.OBS);
  const nomeServico = item.servicoNome ?? parsed.servico;
  const servicoCod = item.servicoCodProd ?? (parsed.servicoCod ? Number(parsed.servicoCod) : null);
  const servicoObs = item.servicoObs ?? null;
  const userObs = parsed.obs;
  const veiculo = [item.veiculoModelo, item.veiculoPlaca].filter(Boolean).join(' · ');

  const calcElapsed = useCallback(() => {
    if (item.HRINI == null) return;
    const startH = Math.floor(item.HRINI / 100);
    const startM = item.HRINI % 100;
    const now = new Date();
    const totalSeconds = Math.max(0,
      (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds())
      - (startH * 3600 + startM * 60)
    );
    setElapsed(formatElapsedTimer(totalSeconds));
  }, [item.HRINI]);

  useEffect(() => {
    calcElapsed();
    const id = setInterval(calcElapsed, 1_000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') calcElapsed();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [calcElapsed]);

  const handleSwitchConfirm = (extra?: Partial<DetalheFormData>) => {
    if (!switchMotivo) return;
    onSwitch(switchMotivo, extra);
    setSwitchMotivo(null);
  };

  const handleStopConfirm = () => {
    setStopSheetOpen(false);
    onStop();
  };

  const others = motivos
    .filter((m) => m.RDOMOTIVOCOD !== item.RDOMOTIVOCOD)
    .sort((a, b) => a.RDOMOTIVOCOD - b.RDOMOTIVOCOD);

  return (
    <Box sx={{
      '@keyframes blink': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
      '@keyframes pulse-glow': {
        '0%, 100%': { boxShadow: `0 0 6px ${alpha(accent, 0.15)}` },
        '50%': { boxShadow: `0 0 16px ${alpha(accent, 0.35)}` },
      },
    }}>

      {/* ACTIVE CARD */}
      <Box sx={{
        display: 'flex', borderRadius: 2.5, overflow: 'hidden', mb: 1.5,
        animation: 'pulse-glow 3s ease-in-out infinite',
      }}>
        {/* LEFT — current activity */}
        <Box sx={{
          flex: 1, bgcolor: accent, color: '#fff',
          px: 1.75, py: 1.25, minWidth: 0,
        }}>
          {/* Status + start time */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <FiberManualRecord sx={{ fontSize: 8, animation: 'blink 1.5s ease-in-out infinite' }} />
              <Typography sx={{
                fontSize: '0.65rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.85,
              }}>
                Em andamento
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <AccessTime sx={{ fontSize: 12, opacity: 0.7 }} />
              <Typography sx={{ fontSize: '0.68rem', opacity: 0.75, fontWeight: 600, fontFamily: MONO }}>
                {hhmmToString(item.HRINI)}
              </Typography>
            </Box>
          </Box>

          {/* Icon + name + code */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              bgcolor: alpha('#fff', 0.18),
              border: `1.5px solid ${alpha('#fff', 0.3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography sx={{
                  px: 0.5, py: 0.1, borderRadius: 0.75,
                  bgcolor: alpha('#fff', 0.2),
                  fontSize: '0.75rem', fontWeight: 800, lineHeight: 1.2, fontFamily: MONO,
                }}>
                  {item.RDOMOTIVOCOD}
                </Typography>
                <Typography sx={{
                  fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.2,
                  fontFamily: MONO, opacity: 0.9,
                }}>
                  {item.motivoSigla}
                </Typography>
              </Box>
              <Typography sx={{
                fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.25, mt: 0.25,
                display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {item.motivoDescricao ?? ''}
              </Typography>
            </Box>
            {/* Elapsed — prominent */}
            <Typography sx={{
              fontSize: '1.5rem', fontWeight: 900, lineHeight: 1, fontFamily: MONO,
              flexShrink: 0,
            }}>
              {elapsed || '0min'}
            </Typography>
          </Box>

          {/* OS + vehicle + service details */}
          {(item.NUOS || nomeServico) && (
            <Box sx={{
              mt: 0.75, pt: 0.6,
              borderTop: `1px solid ${alpha('#fff', 0.15)}`,
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5,
            }}>
              {item.NUOS && (
                <Typography sx={{
                  fontSize: '0.72rem', fontWeight: 800, fontFamily: MONO,
                  px: 0.5, py: 0.1, borderRadius: 0.75,
                  bgcolor: alpha('#fff', 0.2),
                }}>
                  OS {item.NUOS}
                </Typography>
              )}
              {veiculo && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                  <DirectionsCar sx={{ fontSize: 12, opacity: 0.7 }} />
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, opacity: 0.8 }}>
                    {veiculo}
                  </Typography>
                </Box>
              )}
              {nomeServico && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, minWidth: 0 }}>
                  <Build sx={{ fontSize: 11, opacity: 0.7 }} />
                  <Typography noWrap sx={{ fontSize: '0.68rem', fontWeight: 600, opacity: 0.85 }}>
                    {nomeServico}
                  </Typography>
                  {servicoCod != null && (
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.6 }}>
                      #{servicoCod}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Service observation from TCFSERVOS */}
          {servicoObs && (
            <Typography noWrap sx={{
              fontSize: '0.65rem', fontWeight: 500, opacity: 0.75,
              fontStyle: 'italic', mt: 0.25,
            }}>
              {servicoObs}
            </Typography>
          )}
          {/* User observation */}
          {userObs && (
            <Typography noWrap sx={{
              fontSize: '0.65rem', fontWeight: 400, opacity: 0.6,
              fontStyle: 'italic', mt: 0.25,
            }}>
              {userObs}
            </Typography>
          )}
        </Box>

        {/* RIGHT — STOP button */}
        <ButtonBase
          onClick={() => setStopSheetOpen(true)}
          sx={{
            flexShrink: 0, width: 64,
            bgcolor: '#EF4444', color: '#fff',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 0.5,
            borderLeft: `2px solid ${darken('#EF4444', 0.2)}`,
            transition: 'all 80ms',
            '&:active': { bgcolor: '#DC2626' },
          }}
        >
          <Stop sx={{ fontSize: 30 }} />
          <Typography sx={{
            fontSize: '0.65rem', fontWeight: 900, letterSpacing: 2, fontFamily: MONO,
          }}>
            STOP
          </Typography>
        </ButtonBase>
      </Box>

      {/* SWITCH KEYBOARD — compact */}
      <Typography sx={{
        fontSize: '0.65rem', fontWeight: 700, color: 'text.disabled',
        textTransform: 'uppercase', letterSpacing: 2, mb: 0.5, textAlign: 'center',
      }}>
        Trocar para
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
        {others.map((m) => {
          const c = getCatColor(m);
          return (
            <ButtonBase key={m.RDOMOTIVOCOD} onClick={() => setSwitchMotivo(m)}
              sx={(t) => ({
                ...btnSx(c, t.palette.mode === 'dark'),
                py: 0.5, px: 0.25,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              })}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 900, lineHeight: 1, fontFamily: MONO }}>
                {m.RDOMOTIVOCOD}
              </Typography>
              <Typography sx={{
                fontSize: '0.45rem', fontWeight: 700, lineHeight: 1, mt: 0.15,
                letterSpacing: 0.3, opacity: 0.85, fontFamily: MONO,
                textTransform: 'uppercase',
              }}>
                {m.SIGLA}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      {/* Sheets */}
      <ConfirmActivitySheet
        open={switchMotivo != null}
        motivo={switchMotivo}
        onConfirm={handleSwitchConfirm}
        onClose={() => setSwitchMotivo(null)}
        lastNuos={lastNuos}
        actionLabel="Trocar"
        minhasOs={minhasOs}
        osLoading={osLoading}
      />

      <SwipeableDrawer
        anchor="bottom"
        open={stopSheetOpen}
        onClose={() => setStopSheetOpen(false)}
        onOpen={() => {}}
        disableSwipeToOpen
        slotProps={{ paper: { sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, px: 3, pt: 1.5, pb: 4 } } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ width: 32, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
        </Box>

        {/* Recap card */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
          p: 1.5, borderRadius: 2.5, bgcolor: accent, color: '#fff',
        }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '50%',
            bgcolor: alpha('#fff', 0.2),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.25 }}>
              {item.motivoDescricao}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <Typography sx={{
                px: 0.5, py: 0.1, borderRadius: 0.75,
                bgcolor: alpha('#fff', 0.2),
                fontSize: '0.72rem', fontWeight: 800, fontFamily: MONO,
              }}>
                {item.RDOMOTIVOCOD}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: MONO, opacity: 0.9 }}>
                {item.motivoSigla}
              </Typography>
              {item.NUOS && (
                <>
                  <Typography sx={{ opacity: 0.5, fontSize: '0.6rem' }}>·</Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: MONO }}>
                    OS {item.NUOS}
                  </Typography>
                </>
              )}
              {nomeServico && (
                <>
                  <Typography sx={{ opacity: 0.5, fontSize: '0.6rem' }}>·</Typography>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, minWidth: 0 }}>
                    <Build sx={{ fontSize: 11, opacity: 0.8 }} />
                    <Typography noWrap sx={{ fontSize: '0.68rem', fontWeight: 600, opacity: 0.9 }}>
                      {nomeServico}
                    </Typography>
                    {servicoCod != null && (
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.6, fontFamily: MONO }}>
                        #{servicoCod}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Box>
            {/* Vehicle info */}
            {veiculo && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mt: 0.25 }}>
                <DirectionsCar sx={{ fontSize: 12, opacity: 0.7 }} />
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.8 }}>
                  {veiculo}
                </Typography>
              </Box>
            )}
            {/* Service observation */}
            {servicoObs && (
              <Typography noWrap sx={{
                fontSize: '0.63rem', fontWeight: 500, opacity: 0.7,
                fontStyle: 'italic', mt: 0.2,
              }}>
                {servicoObs}
              </Typography>
            )}
            {/* User observation */}
            {userObs && (
              <Typography noWrap sx={{
                fontSize: '0.63rem', fontWeight: 400, opacity: 0.55,
                fontStyle: 'italic', mt: 0.15,
              }}>
                {userObs}
              </Typography>
            )}
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: MONO }}>
              {elapsed}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 600 }}>
              {hhmmToString(item.HRINI)} — agora
            </Typography>
          </Box>
        </Box>

        <Typography fontWeight={800} sx={{ fontSize: '1rem', mb: 0.5 }}>
          Parar atividade?
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 2.5, fontWeight: 500 }}>
          Fim sera registrado como {hhmmToString(agoraHhmm())}
        </Typography>

        <ButtonBase
          onClick={handleStopConfirm}
          sx={(t) => ({ width: '100%', ...btnSx('#DC2626', t.palette.mode === 'dark') })}
        >
          <Box sx={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 1, py: 1.5, borderRadius: 2, bgcolor: '#EF4444', color: '#fff',
          }}>
            <Stop sx={{ fontSize: 22 }} />
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: MONO, letterSpacing: 1 }}>
              PARAR ATIVIDADE
            </Typography>
          </Box>
        </ButtonBase>
      </SwipeableDrawer>
    </Box>
  );
}
