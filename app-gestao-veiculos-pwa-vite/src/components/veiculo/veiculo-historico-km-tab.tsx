import { Box, Typography, Paper, Skeleton } from '@mui/material';
import { Route } from '@mui/icons-material';
import type { VeiculoHistoricoKm } from '@/api/veiculos';
import { fmtDateShort } from '@/utils/fmt';

interface Props { items?: VeiculoHistoricoKm[]; isLoading: boolean }

export function VeiculoHistoricoKmTab({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 2.5 }} />
        ))}
      </Box>
    );
  }

  if (!items?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
        <Route sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
        <Typography variant="body2">Nenhum registro de KM</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((r) => (
        <Paper key={`${r.CODVEICULO}-${r.SEQUENCIA}`} sx={{
          p: 1.5, display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <Box sx={{ flex: '0 0 auto' }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', lineHeight: 1 }}>
              {fmtDateShort(r.DHREFERENCIA)}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{
            fontWeight: 700, fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.95rem',
          }}>
            {r.KM?.toLocaleString('pt-BR') ?? '-'}
            <Typography component="span" variant="caption" sx={{ color: 'text.disabled', ml: 0.5 }}>km</Typography>
          </Typography>
          <Box sx={{ ml: 'auto', textAlign: 'right' }}>
            {r.AD_HORIMETRO != null && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Horim: {r.AD_HORIMETRO}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {r.ORIGEM ?? '-'}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
