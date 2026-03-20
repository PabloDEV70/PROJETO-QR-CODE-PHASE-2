import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Stack, Divider, Chip, Box,
} from '@mui/material';
import { ExpandMore, Calculate } from '@mui/icons-material';
import { fmtMin } from '@/utils/wrench-time-categories';
import type { WtDeductions } from '@/types/wrench-time-types';

interface WtCalcDebugProps {
  deductions: WtDeductions;
  wrenchTimePercent: number;
  totalProdMin: number;
  totalLossMin: number;
}

export function WtCalcDebug({
  deductions: d, wrenchTimePercent, totalProdMin, totalLossMin,
}: WtCalcDebugProps) {
  return (
    <Accordion sx={{ bgcolor: 'background.paper', borderRadius: 2, '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Calculate fontSize="small" color="action" />
          <Typography variant="subtitle2" fontWeight={600}>
            Como o Wrench Time e calculado?
          </Typography>
          <Chip label={`WT ${wrenchTimePercent}%`} size="small" color="primary" variant="outlined" />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Section title="1. Total bruto apontado">
            <Row label="Soma de todos os motivos" value={fmtMin(d.totalBrutoMin)} />
            <Row label="RDOs no periodo" value={String(d.totalRdos)} />
          </Section>

          <Divider />
          <Section title="2. Deducao do almoco (nao conta como produtivo nem improdutivo)">
            <Row label="Almoco real apontado" value={fmtMin(d.almocoTotalMin)} />
            <Row label="Almoco programado (TFPHOR)" value={fmtMin(d.almocoProgramadoMin)} />
            <Row
              label="Deduzido da base"
              value={`-${fmtMin(Math.min(d.almocoTotalMin, d.almocoProgramadoMin))}`}
              highlight
            />
            {d.almocoExcessoMin > 0 && (
              <Row
                label="Excedente → conta como improdutivo"
                value={fmtMin(d.almocoExcessoMin)} color="#d32f2f"
              />
            )}
          </Section>

          <Divider />
          <Section title="3. Deducao do banheiro (tolerancia 10min/RDO)">
            <Row label="Banheiro real apontado" value={fmtMin(d.banheiroTotalMin)} />
            <Row label="Tolerancia (10min x RDOs com banheiro)"
              value={fmtMin(d.banheiroToleranciaMin)} />
            <Row
              label="Deduzido da base"
              value={`-${fmtMin(Math.min(d.banheiroTotalMin, d.banheiroToleranciaMin))}`}
              highlight
            />
            {d.banheiroExcessoMin > 0 && (
              <Row
                label="Excedente → conta como improdutivo"
                value={fmtMin(d.banheiroExcessoMin)} color="#d32f2f"
              />
            )}
          </Section>

          <Divider />
          <Section title="4. Base efetiva (o que realmente conta)">
            <Row label="Total bruto" value={fmtMin(d.totalBrutoMin)} />
            <Row label="- Almoco programado"
              value={`-${fmtMin(Math.min(d.almocoTotalMin, d.almocoProgramadoMin))}`} />
            <Row label="- Banheiro tolerancia"
              value={`-${fmtMin(Math.min(d.banheiroTotalMin, d.banheiroToleranciaMin))}`} />
            <Row label="= Base efetiva" value={fmtMin(d.baseEfetivaMin)} highlight />
          </Section>

          <Divider />
          <Section title="5. Resultado final">
            <Row label="Produtivo (wrench time)" value={fmtMin(totalProdMin)} color="#16A34A" />
            <Row label="Improdutivo (perdas + excessos)" value={fmtMin(totalLossMin)}
              color="#94A3B8" />
            <Box sx={{ mt: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={700} textAlign="center">
                WT% = {fmtMin(totalProdMin)} / {fmtMin(d.baseEfetivaMin)} = {wrenchTimePercent}%
              </Typography>
            </Box>
          </Section>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" fontWeight={700} color="text.secondary"
        sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Typography>
      {children}
    </Stack>
  );
}

function Row({ label, value, highlight, color }: {
  label: string; value: string; highlight?: boolean; color?: string;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pl: 1 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2"
        fontWeight={highlight ? 700 : 500}
        sx={{ color: color || (highlight ? 'primary.main' : 'text.primary'), fontFamily: 'monospace' }}>
        {value}
      </Typography>
    </Stack>
  );
}
