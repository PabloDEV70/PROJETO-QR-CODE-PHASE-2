import { AccessTime, RemoveCircleOutline } from '@mui/icons-material';
import { fm, Row, Section } from '../drawer-shared';
import type { RdoListItem } from '@/types/rdo-types';

export function JornadaSection({ row }: { row: RdoListItem }) {
  const jornada = row.minutosPrevistosDia || 0;
  const intervalo = row.intervaloAlmocoMin || 60;

  return (
    <Section title="Jornada">
      <Row icon={<AccessTime sx={{ fontSize: 16 }} />}
        label="Presenca total"
        value={fm(jornada + intervalo)}
        sub="Trabalho + almoco" />
      <Row indent icon={<RemoveCircleOutline sx={{ fontSize: 16 }} />}
        label="(-) Intervalo intrajornada"
        value={`-${fm(intervalo)}`}
        sub="Almoco programado" color="text.secondary" />
      <Row label="= Carga de trabalho"
        value={fm(jornada)} color="primary.main" />
    </Section>
  );
}
