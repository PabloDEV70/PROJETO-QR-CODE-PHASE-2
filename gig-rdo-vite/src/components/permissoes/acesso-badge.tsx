import { useState } from 'react';
import {
  Typography, Chip, Popover, Box, Stack,
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import type { AcaoTela } from '@/types/permissoes-types';
import { decodeAcesso, acessoSummary } from '@/utils/decode-acesso';

interface AcessoBadgeProps {
  acesso: string | null | undefined;
  acoes?: AcaoTela[];
}

export function AcessoBadge({ acesso, acoes }: AcessoBadgeProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const decoded = decodeAcesso(acesso, acoes);
  const summary = acessoSummary(acesso, acoes);
  const granted = decoded.filter((p) => p.allowed).length;
  const hex = acesso?.trim() || '0';

  return (
    <>
      <Chip
        label={hex}
        size="small"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          fontFamily: 'monospace',
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          bgcolor: granted > 0 ? 'rgba(46,125,50,0.08)' : 'rgba(158,158,158,0.08)',
          border: '1px solid',
          borderColor: granted > 0 ? 'rgba(46,125,50,0.25)' : 'rgba(158,158,158,0.25)',
          '&:hover': {
            bgcolor: granted > 0 ? 'rgba(46,125,50,0.15)' : 'rgba(158,158,158,0.15)',
          },
        }}
      />
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 220, maxWidth: 320 } } }}
      >
        <Box sx={{ p: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Permissoes
            </Typography>
            <Chip
              label={summary}
              size="small"
              sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
            />
          </Stack>
          <Stack spacing={0.25}>
            {decoded.map((p) => (
              <Stack
                key={p.sigla}
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{
                  py: 0.25,
                  px: 0.5,
                  borderRadius: 0.5,
                  bgcolor: p.allowed ? 'rgba(46,125,50,0.06)' : 'transparent',
                }}
              >
                {p.allowed ? (
                  <Check sx={{ fontSize: 14, color: '#2e7d32' }} />
                ) : (
                  <Close sx={{ fontSize: 14, color: '#bdbdbd' }} />
                )}
                <Typography
                  variant="body2"
                  fontSize={12}
                  sx={{ color: p.allowed ? 'text.primary' : 'text.disabled' }}
                >
                  <strong>{p.sigla}</strong> — {p.descricao}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block', fontFamily: 'monospace', fontSize: 10 }}
          >
            hex: 0x{hex.toUpperCase()}
          </Typography>
        </Box>
      </Popover>
    </>
  );
}
