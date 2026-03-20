import { useState, useMemo } from 'react';
import { Box, ButtonBase, Skeleton, Typography, alpha, darken, lighten } from '@mui/material';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import { ConfirmActivitySheet } from '@/components/apontamento/confirm-activity-sheet';
import type { RdoMotivo, DetalheFormData } from '@/types/rdo-types';
import type { OsListItem } from '@/types/os-types';

interface QuickActivityPickerProps {
  motivos: RdoMotivo[];
  isLoading?: boolean;
  onPick: (motivo: RdoMotivo, extra?: Partial<DetalheFormData>) => void;
  disabled?: boolean;
  lastNuos?: number | null;
  minhasOs?: OsListItem[];
  osLoading?: boolean;
}

function getCatColor(m: RdoMotivo): string {
  if (m.PRODUTIVO === 'S') return '#16A34A';
  if (m.WTCATEGORIA) return getCategoryMeta(m.WTCATEGORIA).color;
  return '#64748B';
}

const MONO = '"SF Mono", "Roboto Mono", "Fira Code", monospace';

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

export function QuickActivityPicker({
  motivos, isLoading, onPick, disabled, lastNuos,
  minhasOs, osLoading,
}: QuickActivityPickerProps) {
  const [selectedMotivo, setSelectedMotivo] = useState<RdoMotivo | null>(null);

  const sorted = useMemo(() =>
    [...motivos].sort((a, b) => a.RDOMOTIVOCOD - b.RDOMOTIVOCOD),
  [motivos]);

  const handleConfirm = (extra?: Partial<DetalheFormData>) => {
    if (!selectedMotivo) return;
    onPick(selectedMotivo, extra);
    setSelectedMotivo(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{
        fontSize: '0.7rem', fontWeight: 700, color: 'text.disabled',
        textTransform: 'uppercase', letterSpacing: 2, mb: 0.75, textAlign: 'center',
      }}>
        Iniciar atividade
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
        {sorted.map((m) => {
          const c = getCatColor(m);
          const isProd = m.PRODUTIVO === 'S';
          return (
            <ButtonBase
              key={m.RDOMOTIVOCOD}
              disabled={disabled}
              onClick={() => setSelectedMotivo(m)}
              sx={(t) => ({
                ...btnSx(c, t.palette.mode === 'dark'),
                py: 0.6, px: 0.25,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 0,
                ...(isProd && { gridColumn: 'span 2' }),
              })}
            >
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
                <Typography sx={{
                  fontSize: isProd ? '1.4rem' : '1.15rem',
                  fontWeight: 900, lineHeight: 1, fontFamily: MONO,
                }}>
                  {m.RDOMOTIVOCOD}
                </Typography>
                {isProd && (
                  <Typography sx={{
                    fontSize: '0.85rem', fontWeight: 800, lineHeight: 1,
                    fontFamily: MONO, letterSpacing: 0.5, opacity: 0.95,
                  }}>
                    {m.SIGLA}
                  </Typography>
                )}
              </Box>
              <Typography sx={{
                fontSize: isProd ? '0.55rem' : '0.5rem',
                fontWeight: 700, lineHeight: 1.1, mt: 0.2,
                letterSpacing: 0.3, opacity: 0.85,
                textTransform: 'uppercase',
                textAlign: 'center',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: '100%', px: 0.25,
              }}>
                {isProd ? m.DESCRICAO : m.SIGLA}
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
        actionLabel="Iniciar"
        disabled={disabled}
        minhasOs={minhasOs}
        osLoading={osLoading}
      />
    </Box>
  );
}
