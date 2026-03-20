import { Box, Typography, Paper, Chip } from '@mui/material';
import { Description } from '@mui/icons-material';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';
import type { ContratoVeiculo } from '@/api/veiculos';
import { fmtDateFull } from '@/utils/fmt';

const STATUS_LABEL: Record<string, { label: string; color: 'success' | 'info' | 'default' }> = {
  VIGENTE: { label: 'Vigente', color: 'success' },
  FUTURO: { label: 'Futuro', color: 'info' },
  ENCERRADO: { label: 'Encerrado', color: 'default' },
};

interface Props { items: ContratoVeiculo[] }

export function VeiculoContratosTab({ items }: Props) {
  if (!items?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
        <Description sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
        <Typography variant="body2">Nenhum contrato</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {items.map((c) => {
        const st = STATUS_LABEL[c.statusContrato ?? ''] ?? { label: c.statusContrato ?? 'N/A', color: 'default' as const };
        const isVigente = c.statusContrato === 'VIGENTE';
        return (
          <Paper key={c.id} sx={{
            p: 2, borderLeft: 4,
            borderColor: isVigente ? 'success.main' : c.statusContrato === 'FUTURO' ? 'info.main' : 'divider',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Typography sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                #{c.id}
              </Typography>
              <Chip size="small" label={st.label} color={st.color} />
              {c.diasRestantes != null && c.diasRestantes > 0 && (
                <Typography variant="caption" sx={{ ml: 'auto', fontWeight: 700, color: isVigente ? 'success.main' : 'text.secondary' }}>
                  {c.diasRestantes}d restantes
                </Typography>
              )}
            </Box>
            {c.nomeParc && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                <PessoaAvatar codparc={c.codparc} nome={c.nomeParc} size={24} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.nomeParc}</Typography>
              </Box>
            )}
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
              {fmtDateFull(c.dhinic)} — {fmtDateFull(c.dhfin)}
            </Typography>
            {c.obs && <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>{c.obs}</Typography>}
          </Paper>
        );
      })}
    </Box>
  );
}
