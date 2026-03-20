import { useState, useEffect } from 'react';
import { Box, ButtonBase, SwipeableDrawer, Typography, TextField, alpha, darken, lighten } from '@mui/material';
import { getMotivoIcon } from '@/utils/motivo-icons';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import type { RdoMotivo, DetalheFormData } from '@/types/rdo-types';

interface ConfirmActivitySheetProps {
  open: boolean;
  motivo: RdoMotivo | null;
  onConfirm: (extra?: Partial<DetalheFormData>) => void;
  onClose: () => void;
  lastNuos?: number | null;
  lastPlaca?: string | null;
  actionLabel?: string;
  disabled?: boolean;
}

const MONO = '"SF Mono", "Roboto Mono", "Fira Code", monospace';

function getAccent(m: RdoMotivo): string {
  if (m.PRODUTIVO === 'S') return '#16A34A';
  if (m.WTCATEGORIA) return getCategoryMeta(m.WTCATEGORIA).color;
  return '#64748B';
}

export function ConfirmActivitySheet({
  open, motivo, onConfirm, onClose, lastNuos, lastPlaca,
  actionLabel = 'Iniciar', disabled,
}: ConfirmActivitySheetProps) {
  const [osValue, setOsValue] = useState('');
  const [obsValue, setObsValue] = useState('');
  const isProd = motivo?.PRODUTIVO === 'S';

  useEffect(() => {
    if (open && isProd && lastNuos) {
      setOsValue(String(lastNuos));
    }
    if (!open) {
      setOsValue('');
      setObsValue('');
    }
  }, [open, isProd, lastNuos]);

  const handleConfirm = () => {
    const extra: Partial<DetalheFormData> = {};
    if (osValue.trim()) extra.NUOS = Number(osValue);
    if (obsValue.trim()) extra.OBS = obsValue.trim();
    onConfirm(extra);
  };

  if (!motivo) return null;

  const accent = getAccent(motivo);
  const Icon = getMotivoIcon(motivo.SIGLA);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
            maxHeight: '65vh',
          },
        },
      }}
    >
      {/* Colored header */}
      <Box sx={{
        bgcolor: accent, color: '#fff',
        px: 3, pt: 2, pb: 2.5,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: alpha('#fff', 0.4) }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            bgcolor: alpha('#fff', 0.18),
            border: `2px solid ${alpha('#fff', 0.3)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon sx={{ fontSize: 24 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.25 }}>
              {motivo.DESCRICAO}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Typography sx={{
                px: 0.75, py: 0.15, borderRadius: 1,
                bgcolor: alpha('#fff', 0.2),
                fontSize: '0.85rem', fontWeight: 800, fontFamily: MONO,
              }}>
                {motivo.RDOMOTIVOCOD}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: MONO, opacity: 0.9 }}>
                {motivo.SIGLA}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Form content */}
      <Box sx={{ px: 3, pt: 2.5, pb: 4 }}>
        {/* OS field for produtivos */}
        {isProd && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth size="small"
              label="Numero da OS"
              type="number"
              value={osValue}
              onChange={(e) => setOsValue(e.target.value)}
              slotProps={{ htmlInput: { inputMode: 'numeric', style: { fontSize: '1.1rem', fontWeight: 600 } } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accent },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: accent },
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {lastNuos && (
                <Box
                  component="button"
                  onClick={() => setOsValue(String(lastNuos))}
                  sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                    px: 1.5, py: 0.5, borderRadius: 99,
                    border: '1.5px solid',
                    borderColor: osValue === String(lastNuos) ? accent : 'divider',
                    bgcolor: osValue === String(lastNuos) ? accent : 'transparent',
                    color: osValue === String(lastNuos) ? '#fff' : 'text.secondary',
                    fontSize: '0.8rem', fontWeight: 700, fontFamily: MONO,
                    cursor: 'pointer', transition: 'all 150ms',
                  }}
                >
                  Ultima OS: {lastNuos}
                </Box>
              )}
              {lastPlaca && (
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 500 }}>
                  Veiculo: {lastPlaca}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* OBS */}
        <TextField
          fullWidth size="small"
          label="Observacao (opcional)"
          value={obsValue}
          onChange={(e) => setObsValue(e.target.value)}
          multiline minRows={1} maxRows={3}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accent },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: accent },
          }}
        />

        {/* Confirm — 3D button style */}
        <ButtonBase
          disabled={disabled}
          onClick={handleConfirm}
          sx={{
            width: '100%',
            borderRadius: 2.5,
            background: `linear-gradient(180deg, ${lighten(accent, 0.08)} 0%, ${accent} 40%, ${darken(accent, 0.08)} 100%)`,
            color: '#fff',
            py: 1.5,
            boxShadow: [
              `0 5px 0 0 ${darken(accent, 0.35)}`,
              `0 7px 14px 0 ${alpha(accent, 0.3)}`,
              `inset 0 2px 0 0 ${alpha(lighten(accent, 0.25), 0.5)}`,
            ].join(', '),
            border: `1px solid ${alpha(darken(accent, 0.35), 0.3)}`,
            '&:active': {
              transform: 'translateY(4px)',
              boxShadow: `0 1px 0 0 ${darken(accent, 0.35)}, inset 0 2px 4px ${alpha('#000', 0.15)}`,
            },
            transition: 'all 80ms ease-out',
          }}
        >
          <Typography sx={{ fontSize: '1rem', fontWeight: 800, letterSpacing: 1 }}>
            {actionLabel} {motivo.SIGLA}
          </Typography>
        </ButtonBase>
      </Box>
    </SwipeableDrawer>
  );
}
