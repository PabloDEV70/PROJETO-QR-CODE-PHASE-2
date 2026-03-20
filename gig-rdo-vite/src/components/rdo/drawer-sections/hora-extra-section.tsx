import { Box, Typography, Chip } from '@mui/material';
import { Timer, MoreTime } from '@mui/icons-material';
import { fm, Row, Section } from '../drawer-shared';
import type { RdoListItem } from '@/types/rdo-types';

export function HoraExtraSection({ row }: { row: RdoListItem }) {
  const r = row;
  const hex = r.horaExtraMin || 0;
  const tempoNoTrabalho = r.tempoNoTrabalho || 0;
  const totalBruto = r.totalBrutoMin || r.totalMinutos || 0;

  return (
    <Section title="Hora Extra">
      <Row icon={<Timer sx={{ fontSize: 16 }} />}
        label="Total bruto apontado" value={fm(totalBruto)} />
      <Row indent label="(-) Almoco descontado"
        value={`-${fm(r.almocoDescontadoMin || 0)}`} />
      <Row label="= Tempo no trabalho"
        value={fm(tempoNoTrabalho)} color="primary.main" />
      <Row indent label="(-) Carga de trabalho"
        value={`-${fm(r.minutosPrevistosDia || 0)}`} />
      <Row icon={<MoreTime sx={{ fontSize: 16 }} />}
        label="= Hora extra" value={fm(hex)}
        color={hex > 0 ? 'warning.main' : 'text.disabled'} />
      <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.5, mt: 0.5 }}>
        <Chip size="small"
          label={hex > 0 ? `HEX: ${fm(hex)}` : 'Sem hora extra'}
          color={hex > 0 ? 'warning' : 'default'} variant="filled"
          sx={{ fontWeight: 600 }} />
        <Typography variant="caption" color="text.secondary"
          display="block" sx={{ mt: 0.5 }}>
          Independente da produtividade. Banheiro nao afeta.
        </Typography>
      </Box>
    </Section>
  );
}
