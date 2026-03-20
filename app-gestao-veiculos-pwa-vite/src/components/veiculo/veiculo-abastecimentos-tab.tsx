import { Box, Typography, Paper, Skeleton } from '@mui/material';
import { LocalGasStation } from '@mui/icons-material';
import type { VeiculoAbastecimento } from '@/api/veiculos';
import { fmtDateShort } from '@/utils/fmt';

const ABT_STATUS: Record<string, string> = {
  A: 'Aprovado', P: 'Pendente', R: 'Rejeitado', C: 'Cancelado',
};

interface Props { items?: VeiculoAbastecimento[]; isLoading: boolean }

export function VeiculoAbastecimentosTab({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 2.5 }} />
        ))}
      </Box>
    );
  }

  if (!items?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
        <LocalGasStation sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
        <Typography variant="body2">Nenhum abastecimento</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((a) => (
        <Paper key={a.IDABT} sx={{
          p: 1.5, display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0.75,
        }}>
          <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {fmtDateShort(a.DHABT)}
            </Typography>
            <Typography variant="caption" sx={{
              px: 1, py: 0.25, borderRadius: 1,
              bgcolor: a.STATUS === 'A' ? 'success.light' : 'action.hover',
              color: a.STATUS === 'A' ? 'success.dark' : 'text.secondary',
              fontWeight: 600,
            }}>
              {a.STATUS ? (ABT_STATUS[a.STATUS] ?? a.STATUS) : '-'}
            </Typography>
          </Box>
          <MetaCell label="KM" value={a.KM?.toLocaleString('pt-BR')} mono />
          <MetaCell label="Horimetro" value={a.HORIMETRO != null ? String(a.HORIMETRO) : null} mono />
          {a.NUNOTA && <MetaCell label="NF" value={String(a.NUNOTA)} />}
        </Paper>
      ))}
    </Box>
  );
}

function MetaCell({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', lineHeight: 1, mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{
        fontWeight: 600,
        ...(mono && { fontFamily: '"JetBrains Mono", monospace' }),
      }}>
        {value ?? '-'}
      </Typography>
    </Box>
  );
}
