import { Box, Typography, Paper, Skeleton } from '@mui/material';
import { LocalGasStation } from '@mui/icons-material';
import type { VeiculoConsumo } from '@/api/veiculos';
import { fmtDateShort, fmtNum, fmtBrl } from '@/utils/fmt';

interface Props { items?: VeiculoConsumo[]; isLoading: boolean }

export function VeiculoConsumoTab({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={88} sx={{ borderRadius: 2.5 }} />
        ))}
      </Box>
    );
  }

  if (!items?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
        <LocalGasStation sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
        <Typography variant="body2">Nenhum registro de consumo</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((c) => (
        <Paper key={c.ID} sx={{ p: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {fmtDateShort(c.DATA_ABASTECIMENTO)}
            </Typography>
            {c.MOTORISTA && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                {c.MOTORISTA}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            <MetaCell label="Litros" value={fmtNum(c.LITROS)} />
            <MetaCell label="KM/L" value={fmtNum(c.KMPORLITRO)}
              highlight={(c.KMPORLITRO ?? 0) > 0} />
            <MetaCell label="R$/L" value={fmtBrl(c.VALORMEDIOLITRO)} />
            <MetaCell label="KM Rodados" value={c.KMRODADOS?.toLocaleString('pt-BR') ?? '-'} />
            <MetaCell label="Horas" value={fmtNum(c.HORASTRABALHADAS, 1)} />
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

function MetaCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', lineHeight: 1, mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{
        fontWeight: 600,
        fontFamily: '"JetBrains Mono", monospace',
        ...(highlight && { color: 'success.main' }),
      }}>
        {value}
      </Typography>
    </Box>
  );
}
