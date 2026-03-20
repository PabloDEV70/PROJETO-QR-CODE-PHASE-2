import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { CheckCircle, FiberManualRecord, Stop, Build } from '@mui/icons-material';
import { getMotivoIcon } from '@/utils/motivo-icons';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import { formatElapsedTimer } from '@/utils/hora-utils';
import type { RdoDetalheItem } from '@/types/rdo-types';

interface ActiveActivityProps {
  detalhe: RdoDetalheItem;
  onStop: () => void;
  onFinishServico?: () => void;
  isPending?: boolean;
}

function getCatColor(d: RdoDetalheItem): string {
  if (d.motivoProdutivo === 'S') return '#16a34a';
  if (d.motivoCategoria) return getCategoryMeta(d.motivoCategoria).color;
  return '#64748B';
}

export function ActiveActivity({ detalhe, onStop, onFinishServico, isPending }: ActiveActivityProps) {
  const [elapsed, setElapsed] = useState('00:00:00');
  const accent = getCatColor(detalhe);
  const Icon = getMotivoIcon(detalhe.motivoSigla);
  const hasService = !!(detalhe.NUOS && detalhe.AD_SEQUENCIA_OS);

  const calcElapsed = useCallback(() => {
    if (detalhe.HRINI == null) return;
    const sH = Math.floor(detalhe.HRINI / 100);
    const sM = detalhe.HRINI % 100;
    const now = new Date();
    const secs = Math.max(0, now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() - (sH * 3600 + sM * 60));
    setElapsed(formatElapsedTimer(secs));
  }, [detalhe.HRINI]);

  useEffect(() => {
    calcElapsed();
    const id = setInterval(calcElapsed, 1_000);
    const vis = () => { if (document.visibilityState === 'visible') calcElapsed(); };
    document.addEventListener('visibilitychange', vis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', vis); };
  }, [calcElapsed]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 64, px: 2, py: 1, gap: 1.5 }}>
      {/* Accent icon */}
      <Box sx={{
        width: 40, height: 40, borderRadius: 1, flexShrink: 0,
        bgcolor: accent, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon sx={{ fontSize: 22 }} />
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FiberManualRecord sx={{
            fontSize: 7, color: accent,
            animation: 'ap-pulse 2s infinite',
            '@keyframes ap-pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
          }} />
          <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Atividade em andamento
          </Typography>
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: accent, lineHeight: 1.25 }}>
          {detalhe.motivoSigla} — {detalhe.motivoDescricao}
        </Typography>

        {/* OS + Service details */}
        {hasService ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.15 }}>
            {detalhe.veiculoPlaca && (
              <Box sx={{ px: 0.5, py: 0.1, borderRadius: 0.4, bgcolor: '#1a237e', color: '#fff', flexShrink: 0 }}>
                <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.56rem', fontWeight: 700 }}>
                  {detalhe.veiculoPlaca}
                </Typography>
              </Box>
            )}
            <Typography sx={{ fontSize: '0.58rem', color: 'text.secondary', fontWeight: 600 }}>
              OS {detalhe.NUOS}
            </Typography>
            <Build sx={{ fontSize: 10, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.56rem', color: accent, fontWeight: 600 }} noWrap>
              {detalhe.servicoNome ?? `#${detalhe.servicoCodProd}`}
            </Typography>
          </Box>
        ) : (detalhe.NUOS || detalhe.veiculoPlaca) ? (
          <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', lineHeight: 1.3 }} noWrap>
            {[detalhe.NUOS ? `OS ${detalhe.NUOS}` : null, detalhe.veiculoPlaca].filter(Boolean).join(' · ')}
          </Typography>
        ) : null}
      </Box>

      {/* Timer */}
      <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
        <Typography sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '1.6rem', fontWeight: 800, color: accent, lineHeight: 1,
        }}>
          {elapsed}
        </Typography>
        {detalhe.hriniFormatada && (
          <Typography sx={{ fontSize: '0.5rem', color: 'text.disabled', mt: 0.2 }}>
            inicio {detalhe.hriniFormatada}
          </Typography>
        )}
      </Box>

      {/* Finish Service */}
      {hasService && onFinishServico && (
        <Button
          onClick={onFinishServico} disabled={isPending} variant="contained"
          sx={{
            bgcolor: '#2e7d32', color: '#fff', fontWeight: 700, fontSize: '0.7rem',
            minWidth: 80, height: 40, borderRadius: 1, flexShrink: 0,
            '&:hover': { bgcolor: '#1b5e20' },
            '&:active': { transform: 'scale(0.96)' },
          }}
        >
          <CheckCircle sx={{ fontSize: 18, mr: 0.4 }} />
          FINALIZAR
        </Button>
      )}

      {/* Stop */}
      <Button
        onClick={onStop} disabled={isPending} variant="contained"
        sx={{
          bgcolor: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.78rem',
          minWidth: 96, height: 40, borderRadius: 1, flexShrink: 0,
          '&:hover': { bgcolor: '#dc2626' },
          '&:active': { transform: 'scale(0.96)' },
        }}
      >
        <Stop sx={{ fontSize: 20, mr: 0.4 }} />
        PARAR
      </Button>
    </Box>
  );
}
