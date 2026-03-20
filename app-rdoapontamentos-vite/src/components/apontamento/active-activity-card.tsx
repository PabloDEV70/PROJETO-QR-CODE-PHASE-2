import { useState, useEffect, useCallback } from 'react';
import {
  Box, ButtonBase, SwipeableDrawer,
  Typography, alpha, darken, lighten,
} from '@mui/material';
import { Stop, FiberManualRecord, AccessTime } from '@mui/icons-material';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import { getMotivoIconProd, getMotivoIcon } from '@/utils/motivo-icons';
import { hhmmToString, agoraHhmm, hhmmToMinutos, formatMinutos } from '@/utils/hora-utils';
import { ConfirmActivitySheet } from '@/components/apontamento/confirm-activity-sheet';
import type { RdoDetalheItem, RdoMotivo, DetalheFormData } from '@/types/rdo-types';

interface ActiveActivityCardProps {
  item: RdoDetalheItem;
  onSwitch: (motivo: RdoMotivo, extra?: Partial<DetalheFormData>) => void;
  onStop: () => void;
  motivos: RdoMotivo[];
  lastNuos?: number | null;
  lastPlaca?: string | null;
}

const MONO = '"SF Mono", "Roboto Mono", "Fira Code", monospace';

function getCatColor(m: RdoMotivo): string {
  if (m.PRODUTIVO === 'S') return '#16A34A';
  if (m.WTCATEGORIA) return getCategoryMeta(m.WTCATEGORIA).color;
  return '#64748B';
}

function btnSx(c: string, isDark: boolean) {
  const face = isDark ? lighten(c, 0.05) : c;
  const topEdge = lighten(c, isDark ? 0.15 : 0.25);
  const bottomEdge = darken(c, 0.35);
  return {
    borderRadius: 2.5,
    background: `linear-gradient(180deg, ${lighten(face, 0.08)} 0%, ${face} 40%, ${darken(face, 0.08)} 100%)`,
    color: '#fff',
    boxShadow: [
      `0 5px 0 0 ${bottomEdge}`,
      `0 7px 14px 0 ${alpha(c, 0.3)}`,
      `inset 0 2px 0 0 ${alpha(topEdge, 0.5)}`,
      `inset 0 -1px 0 0 ${alpha('#000', 0.15)}`,
    ].join(', '),
    border: `1px solid ${alpha(bottomEdge, 0.3)}`,
    '&:active': {
      transform: 'translateY(4px)',
      boxShadow: [
        `0 1px 0 0 ${bottomEdge}`,
        `0 2px 4px 0 ${alpha(c, 0.15)}`,
        `inset 0 2px 4px 0 ${alpha('#000', 0.15)}`,
      ].join(', '),
    },
    transition: 'all 80ms ease-out',
  };
}

export function ActiveActivityCard({
  item, onSwitch, onStop, motivos, lastNuos, lastPlaca,
}: ActiveActivityCardProps) {
  const [elapsed, setElapsed] = useState('');
  const [switchMotivo, setSwitchMotivo] = useState<RdoMotivo | null>(null);
  const [stopSheetOpen, setStopSheetOpen] = useState(false);
  const isProd = item.motivoProdutivo === 'S';
  const accent = item.motivoCategoria
    ? getCategoryMeta(item.motivoCategoria).color
    : (isProd ? '#16A34A' : '#F59E0B');
  const Icon = isProd ? getMotivoIconProd(item.motivoSigla) : getMotivoIcon(item.motivoSigla);

  const calcElapsed = useCallback(() => {
    if (item.HRINI == null) return;
    const diff = Math.max(0, hhmmToMinutos(agoraHhmm()) - hhmmToMinutos(item.HRINI));
    setElapsed(formatMinutos(diff));
  }, [item.HRINI]);

  useEffect(() => {
    calcElapsed();
    const id = setInterval(calcElapsed, 15_000);
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
        '0%, 100%': { boxShadow: `0 0 8px ${alpha(accent, 0.2)}, 0 2px 12px ${alpha(accent, 0.1)}` },
        '50%': { boxShadow: `0 0 20px ${alpha(accent, 0.4)}, 0 4px 24px ${alpha(accent, 0.2)}` },
      },
    }}>

      {/* ══ ATIVIDADE + STOP — unified card ══ */}
      <Box sx={{
        display: 'flex', borderRadius: 3, overflow: 'hidden', mb: 2.5,
        animation: 'pulse-glow 3s ease-in-out infinite',
      }}>
        {/* LEFT — atividade atual */}
        <Box sx={{
          flex: 1, bgcolor: accent, color: '#fff',
          px: 2, py: 1.75, minWidth: 0,
        }}>
          {/* Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.25 }}>
            <FiberManualRecord sx={{ fontSize: 10, animation: 'blink 1.5s ease-in-out infinite' }} />
            <Typography sx={{
              fontSize: '0.75rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.9,
            }}>
              Em andamento
            </Typography>
          </Box>

          {/* Icon + Descrição + Cod/Sigla */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box sx={{
              width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
              bgcolor: alpha('#fff', 0.18),
              border: `2px solid ${alpha('#fff', 0.3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon sx={{ fontSize: 24 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{
                fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.25,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {item.motivoDescricao ?? ''}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                <Typography sx={{
                  px: 0.75, py: 0.15, borderRadius: 1,
                  bgcolor: alpha('#fff', 0.2),
                  fontSize: '0.85rem', fontWeight: 800, lineHeight: 1.2, fontFamily: MONO,
                }}>
                  {item.RDOMOTIVOCOD}
                </Typography>
                <Typography sx={{
                  fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.2,
                  fontFamily: MONO, letterSpacing: 0.5, opacity: 0.9,
                }}>
                  {item.motivoSigla}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Timer + meta */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 1.5 }}>
            <Typography sx={{
              fontSize: '1.75rem', fontWeight: 900, lineHeight: 1, fontFamily: MONO,
            }}>
              {elapsed || '0min'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 14, opacity: 0.75 }} />
              <Typography sx={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 600 }}>
                {hhmmToString(item.HRINI)}
              </Typography>
              {item.NUOS ? (
                <Typography sx={{
                  ml: 0.5, px: 0.75, py: 0.15, borderRadius: 1,
                  bgcolor: alpha('#fff', 0.2),
                  fontSize: '0.7rem', fontWeight: 700,
                }}>
                  OS {item.NUOS}
                </Typography>
              ) : null}
            </Box>
          </Box>
        </Box>

        {/* RIGHT — STOP */}
        <ButtonBase

          onClick={() => setStopSheetOpen(true)}
          sx={{
            flexShrink: 0, width: 80,
            bgcolor: '#EF4444', color: '#fff',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 0.75,
            borderLeft: `3px solid ${darken('#EF4444', 0.2)}`,
            transition: 'all 100ms',
            '&:active': { bgcolor: '#DC2626' },
          }}
        >
          <Stop sx={{ fontSize: 36 }} />
          <Typography sx={{
            fontSize: '0.8rem', fontWeight: 900, letterSpacing: 2, fontFamily: MONO,
          }}>
            STOP
          </Typography>
        </ButtonBase>
      </Box>

      {/* ══ TECLADO ══ */}
      <Typography sx={{
        fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary',
        textTransform: 'uppercase', letterSpacing: 1.5, mb: 1, textAlign: 'center',
      }}>
        Trocar para
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        {others.map((m) => {
          const c = getCatColor(m);
          return (
            <ButtonBase key={m.RDOMOTIVOCOD} onClick={() => setSwitchMotivo(m)}
              sx={(t) => ({
                ...btnSx(c, t.palette.mode === 'dark'),
                py: 1, px: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              })}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 900, lineHeight: 1, fontFamily: MONO }}>
                    {m.RDOMOTIVOCOD}
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.7rem', fontWeight: 700, lineHeight: 1,
                    letterSpacing: 0.5, opacity: 0.9, fontFamily: MONO,
                  }}>
                    {m.SIGLA}
                  </Typography>
                </Box>
                <Typography sx={{
                  fontSize: '0.6rem', fontWeight: 600, lineHeight: 1.2, mt: 0.4,
                  opacity: 0.85, textAlign: 'center',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {m.DESCRICAO}
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
        lastPlaca={lastPlaca}
        actionLabel="Trocar"
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

        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
          p: 1.5, borderRadius: 2.5, bgcolor: accent, color: '#fff',
        }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '50%',
            bgcolor: alpha('#fff', 0.2),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.25 }}>
              {item.motivoDescricao}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.35 }}>
              <Typography sx={{
                px: 0.6, py: 0.1, borderRadius: 1,
                bgcolor: alpha('#fff', 0.2),
                fontSize: '0.8rem', fontWeight: 800, fontFamily: MONO,
              }}>
                {item.RDOMOTIVOCOD}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: MONO, opacity: 0.9 }}>
                {item.motivoSigla}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: MONO }}>
              {elapsed}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', opacity: 0.75, fontWeight: 600 }}>
              {hhmmToString(item.HRINI)} — agora
            </Typography>
          </Box>
        </Box>

        <Typography fontWeight={800} sx={{ fontSize: '1.1rem', mb: 0.5 }}>
          Parar atividade?
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', mb: 2.5, fontWeight: 500 }}>
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
            <Stop sx={{ fontSize: 24 }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, fontFamily: MONO, letterSpacing: 1 }}>
              PARAR ATIVIDADE
            </Typography>
          </Box>
        </ButtonBase>
      </SwipeableDrawer>
    </Box>
  );
}
