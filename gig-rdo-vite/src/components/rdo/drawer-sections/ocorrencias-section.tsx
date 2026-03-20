import { Restaurant, Wc, SmokingRooms } from '@mui/icons-material';
import { fm, Row, Section } from '../drawer-shared';
import type { RdoListItem } from '@/types/rdo-types';

export function OcorrenciasSection({ row }: { row: RdoListItem }) {
  const r = row;
  const banheiroTol = r.tolerancias?.banheiro?.minutos ?? 10;
  const fumarPen = r.tolerancias?.fumar?.minutos ?? 5;
  const banheiroExcesso = Math.max((r.banheiroMin || 0) - banheiroTol, 0);

  return (
    <Section title="Ocorrencias no dia">
      <Row icon={<Restaurant sx={{ fontSize: 16 }} />}
        label="Almoco" value={`${r.almocoQtd || 0}x = ${fm(r.almocoMin || 0)}`} />
      <Row indent label="Intervalo intrajornada"
        value={fm(r.intervaloAlmocoMin || 60)} sub="Tempo livre previsto" />
      <Row indent label="Descontado da jornada"
        value={fm(r.almocoDescontadoMin || 0)} sub="Nao abate da produtividade" />

      <Row icon={<Wc sx={{ fontSize: 16 }} />}
        label="Banheiro" value={`${r.banheiroQtd || 0}x = ${fm(r.banheiroMin || 0)}`}
        color={banheiroExcesso > 0 ? 'warning.main' : undefined} />
      <Row indent label="Tolerancia livre"
        value={fm(Math.min(r.banheiroMin || 0, banheiroTol))}
        sub={`Ate ${banheiroTol}min nao abate`} />
      {banheiroExcesso > 0 && (
        <Row indent label="Excesso (abate performance)"
          value={`-${fm(banheiroExcesso)}`}
          sub={`${r.banheiroMin}min - ${banheiroTol}min = ${banheiroExcesso}min`}
          color="warning.main" />
      )}

      <Row icon={<SmokingRooms sx={{ fontSize: 16 }} />}
        label="Fumar" value={`${r.fumarQtd || 0}x`}
        color={(r.fumarQtd || 0) > 0 ? 'error.main' : undefined} />
      {(r.fumarQtd || 0) > 0 && (<>
        <Row indent label="Tempo real" value={fm(r.fumarMinReal || 0)} />
        <Row indent label="Penalidade fixa"
          value={`${r.fumarQtd}x ${fumarPen}min = -${fm(r.minutosFumarPenalidade || 0)}`}
          sub="Abate dos min. produtivos" color="error.main" />
      </>)}
    </Section>
  );
}
