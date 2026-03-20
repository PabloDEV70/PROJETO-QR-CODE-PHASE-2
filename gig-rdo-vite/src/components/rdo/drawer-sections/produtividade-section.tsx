import { Box, Typography, Stack, Chip } from '@mui/material';
import { CheckCircle, TrendingUp, RemoveCircleOutline } from '@mui/icons-material';
import { fm, Row, Section } from '../drawer-shared';
import type { RdoListItem } from '@/types/rdo-types';
export function ProdutividadeSection({ row }: { row: RdoListItem }) {
  const r = row;
  const tnt = r.tempoNoTrabalho || 0;
  const pct = r.produtividadePercent ?? 0;
  const faixa = r.diagnosticoFaixa?.faixa ?? { label: r.diagnostico || 'Critico', color: 'error' };

  return (
    <Section title="Produtividade">
      <Row icon={<TrendingUp sx={{ fontSize: 16 }} />}
        label="Tempo no trabalho" value={fm(tnt)}
        sub="Base do calculo (bruto - almoco)"
        color="primary.main" />
      <Row icon={<CheckCircle sx={{ fontSize: 16 }} />} color="success.main"
        label="Min. produtivos (bruto)"
        value={fm((r.minutosProdu || 0) + (r.minutosFumarPenalidade || 0))} />
      {(r.minutosFumarPenalidade || 0) > 0 && (
        <Row indent icon={<RemoveCircleOutline sx={{ fontSize: 16 }} />}
          label="(-) Penalidade fumar"
          value={`-${fm(r.minutosFumarPenalidade)}`} color="error.main" />
      )}
      <Row label="= Min. produtivos efetivos"
        value={fm(r.minutosProdu || 0)} color="success.main" />

      <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.5, mt: 0.5 }}>
        <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
          {fm(r.minutosProdu || 0)} &divide; {fm(tnt)} = {pct}%
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
          <Chip size="small"
            label={faixa.label}
            color={faixa.color as 'success' | 'warning' | 'error' | 'default'} variant="filled"
            sx={{ fontWeight: 600 }} />
          {pct > 100 && (
            <Typography variant="caption" color="success.main" fontWeight={600}>
              +{pct - 100}% acima
            </Typography>
          )}
        </Stack>
      </Box>
    </Section>
  );
}
