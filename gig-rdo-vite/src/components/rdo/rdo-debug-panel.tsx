import { useState } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Chip, Paper, Stack, Typography,
} from '@mui/material';
import { BugReport, ExpandMore } from '@mui/icons-material';
import type { RdoListItem, RdoDetalheCompleto } from '@/types/rdo-types';
import type { HorasEsperadasResponse } from '@/types/horas-esperadas-types';
import {
  TempoSection, DeducoesSection, ProdutividadeSection,
  HorasEsperadasSection, DiagnosticoSection,
} from './rdo-debug-sections';
import { DetalhesSection } from './rdo-debug-detalhes';

interface RdoDebugPanelProps {
  metricas: RdoListItem | undefined;
  detalhes: RdoDetalheCompleto[] | undefined;
  horasEsperadas: HorasEsperadasResponse | undefined;
  esperadoRawH: number | undefined;
  jornadaMin: number;
  metaEfMin: number;
  tolRatio: number;
  esperadoAjustado: string | null;
  diagnostico: string | undefined;
}

export function RdoDebugPanel(props: RdoDebugPanelProps) {
  const { metricas: m, detalhes, horasEsperadas: he } = props;
  const [open, setOpen] = useState(false);

  if (!m) return null;

  const calc = {
    esperadoRawH: props.esperadoRawH,
    jornadaMin: props.jornadaMin,
    metaEfMin: props.metaEfMin,
    tolRatio: props.tolRatio,
    esperadoAjustado: props.esperadoAjustado,
    diagnostico: props.diagnostico,
  };

  return (
    <Paper sx={{ mt: 3, border: '1px dashed', borderColor: 'warning.main', bgcolor: '#FFFDE7' }}>
      <Accordion expanded={open} onChange={() => setOpen(!open)} sx={{ bgcolor: 'transparent' }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <BugReport fontSize="small" color="warning" />
            <Typography variant="subtitle2" fontWeight="bold">Debug dos Calculos</Typography>
            <Chip label="DEV" size="small" color="warning" sx={{ height: 18, fontSize: 10 }} />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TempoSection m={m} />
            <DeducoesSection m={m} />
            <ProdutividadeSection m={m} />
            <HorasEsperadasSection calc={calc} he={he} />
            <DiagnosticoSection m={m} calc={calc} />
            {detalhes && <DetalhesSection detalhes={detalhes} />}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
