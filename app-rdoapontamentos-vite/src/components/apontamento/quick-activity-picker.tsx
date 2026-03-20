import { useState, useMemo } from 'react';
import { Box, ButtonBase, Skeleton, Typography, alpha, darken, lighten } from '@mui/material';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import { ConfirmActivitySheet } from '@/components/apontamento/confirm-activity-sheet';
import type { RdoMotivo, DetalheFormData } from '@/types/rdo-types';

interface QuickActivityPickerProps {
  motivos: RdoMotivo[];
  isLoading?: boolean;
  onPick: (motivo: RdoMotivo, extra?: Partial<DetalheFormData>) => void;
  disabled?: boolean;
  lastNuos?: number | null;
  lastPlaca?: string | null;
}

function getCatColor(m: RdoMotivo): string {
  if (m.PRODUTIVO === 'S') return '#16A34A';
  if (m.WTCATEGORIA) return getCategoryMeta(m.WTCATEGORIA).color;
  return '#64748B';
}

const MONO = '"SF Mono", "Roboto Mono", "Fira Code", monospace';

/** 3D button — thick bottom edge + top highlight + gradient face */
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

export function QuickActivityPicker({
  motivos, isLoading, onPick, disabled, lastNuos, lastPlaca,
}: QuickActivityPickerProps) {
  const [selectedMotivo, setSelectedMotivo] = useState<RdoMotivo | null>(null);

  const { hero, rest } = useMemo(() => {
    const heroItem = motivos.find((m) => m.SIGLA === 'ATVP') ?? null;
    const others = motivos
      .filter((m) => m.SIGLA !== 'ATVP')
      .sort((a, b) => a.RDOMOTIVOCOD - b.RDOMOTIVOCOD);
    return { hero: heroItem, rest: others };
  }, [motivos]);

  const handleConfirm = (extra?: Partial<DetalheFormData>) => {
    if (!selectedMotivo) return;
    onPick(selectedMotivo, extra);
    setSelectedMotivo(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 2.5 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{
        fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary',
        textTransform: 'uppercase', letterSpacing: 1.5, mb: 1, textAlign: 'center',
      }}>
        Iniciar atividade
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '6px',
      }}>
        {/* ATVP hero — span 2 */}
        {hero && (() => {
          const c = getCatColor(hero);
          return (
            <ButtonBase
              disabled={disabled}
              onClick={() => setSelectedMotivo(hero)}
              sx={(t) => ({
                gridColumn: 'span 2',
                ...btnSx(c, t.palette.mode === 'dark'),
                px: 1.75, py: 1.5,
                display: 'flex', alignItems: 'baseline', gap: 1,
              })}
            >
              <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1, fontFamily: MONO }}>
                {hero.RDOMOTIVOCOD}
              </Typography>
              <Box>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1, letterSpacing: 1, fontFamily: MONO }}>
                  {hero.SIGLA}
                </Typography>
                <Typography sx={{ fontSize: '0.6rem', lineHeight: 1.2, mt: 0.25, opacity: 0.85, fontWeight: 500 }}>
                  {hero.DESCRICAO}
                </Typography>
              </Box>
            </ButtonBase>
          );
        })()}

        {/* Rest */}
        {rest.map((m) => {
          const c = getCatColor(m);
          return (
            <ButtonBase key={m.RDOMOTIVOCOD} disabled={disabled} onClick={() => setSelectedMotivo(m)}
              sx={(t) => ({
                ...btnSx(c, t.palette.mode === 'dark'),
                py: 1, px: 0.5,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              })}>
              <Typography sx={{
                fontSize: '1.5rem', fontWeight: 900, lineHeight: 1, fontFamily: MONO,
              }}>
                {m.RDOMOTIVOCOD}
              </Typography>
              <Typography sx={{
                fontSize: '0.65rem', fontWeight: 700, lineHeight: 1, mt: 0.4,
                letterSpacing: 0.5, opacity: 0.9, fontFamily: MONO,
              }}>
                {m.SIGLA}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      <ConfirmActivitySheet
        open={selectedMotivo != null}
        motivo={selectedMotivo}
        onConfirm={handleConfirm}
        onClose={() => setSelectedMotivo(null)}
        lastNuos={lastNuos}
        lastPlaca={lastPlaca}
        actionLabel="Iniciar"
        disabled={disabled}
      />
    </Box>
  );
}
