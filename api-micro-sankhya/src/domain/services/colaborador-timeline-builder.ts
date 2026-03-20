import {
  ColaboradorTimelineAtividade,
  ColaboradorJornadaDia,
  MOTIVO_ALMOCO,
  PRODUTIVIDADE_MODE,
} from '../../types/AD_RDOAPONTAMENTOS';
import { MotivoConfigMap } from '../../types/AD_RDOMOTIVOS';
import { labelDiaSemana } from '../../shared/constants/dias-semana';
import { formatHorario } from '../../shared/utils/sankhya-formatters';
import { AtividadeRow, CargaTurnoInfo, CargaDiaInfo } from './colaborador-timeline.types';
import { CargaDiaMeta } from './colaborador-meta-calculator';

export function buildJornadaSemanal(dias: CargaDiaInfo[]): ColaboradorJornadaDia[] {
  return dias.map((d) => ({
    diasem: d.diasem,
    diasemLabel: labelDiaSemana(d.diasem),
    folga: d.folga,
    totalMin: d.minutosPrevistos,
    turnos: d.turnos.map((t) => ({
      entrada: t.entrada,
      saida: t.saida,
      minutos: t.minutos,
    })),
  }));
}

export function buildCargaMap(dias: CargaDiaInfo[]): Map<number, CargaDiaMeta> {
  const map = new Map<number, CargaDiaMeta>();
  for (const d of dias) {
    if (d.folga) continue;
    const sorted = [...d.turnos].sort((a, b) => a.entrada.localeCompare(b.entrada));
    const jornadaInicio = sorted.length > 0 ? sorted[0].entrada : '08:00';
    const jornadaFim = sorted.length > 0 ? sorted[sorted.length - 1].saida : '17:00';
    map.set(d.diasem, {
      minutosPrevistos: d.minutosPrevistos,
      intervaloAlmocoMin: calcIntervaloAlmoco(d.turnos),
      jornadaInicio,
      jornadaFim,
    });
  }
  return map;
}

/** Calcula o gap entre turnos (intervalo de almoco implicito na jornada) */
function calcIntervaloAlmoco(turnos: CargaTurnoInfo[]): number {
  if (turnos.length < 2) return 0;
  const sorted = [...turnos].sort((a, b) => a.entrada.localeCompare(b.entrada));
  let gap = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prevFim = horaParaMinutos(sorted[i - 1].saida);
    const currIni = horaParaMinutos(sorted[i].entrada);
    if (currIni > prevFim) gap += currIni - prevFim;
  }
  return gap;
}

function horaParaMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function formatAtividade(
  a: AtividadeRow,
  configMap: MotivoConfigMap,
): ColaboradorTimelineAtividade {
  const cfg = configMap.get(a.rdomotivocod);
  const isSpecial = a.rdomotivocod === MOTIVO_ALMOCO
    || (cfg?.toleranciaMin ?? 0) > 0
    || (cfg?.penalidadeMin ?? 0) > 0;
  const isProdutivo = PRODUTIVIDADE_MODE === 'ESTRITO'
    ? (cfg?.produtivo ?? false)
    : !isSpecial;
  return {
    id: a.codrdo * 1000 + a.item,
    codrdo: a.codrdo,
    hrini: formatHorario(a.hrini) || '00:00',
    hrfim: formatHorario(a.hrfim) || '00:00',
    duracaoMinutos: a.duracaoMinutos,
    rdomotivocod: a.rdomotivocod,
    motivoDescricao: a.motivoDescricao || 'Sem motivo',
    motivoSigla: a.motivoSigla || '?',
    isProdutivo,
    nuos: a.nuos,
    veiculoPlaca: a.veiculoPlaca,
    veiculoModelo: a.veiculoModelo,
    obs: a.obs,
  };
}

export function buildCargaHorariaResponse(carga: {
  codcargahor: number;
  totalMinutosSemana: number;
  totalHorasSemanaFmt: string;
  dias: CargaDiaInfo[];
}) {
  const diasUteis = carga.dias.filter((d) => !d.folga && d.turnos.length > 0);
  const diaPrincipal = diasUteis.reduce(
    (best, d) => (d.minutosPrevistos > best.minutosPrevistos ? d : best),
    diasUteis[0],
  );

  let inicio = '08:00';
  let fim = '17:00';
  let intervaloInicio = '12:00';
  let intervaloFim = '13:00';

  if (diaPrincipal?.turnos.length) {
    const sorted = [...diaPrincipal.turnos].sort(
      (a, b) => a.entrada.localeCompare(b.entrada),
    );
    inicio = sorted[0].entrada;
    fim = sorted[sorted.length - 1].saida;
    if (sorted.length >= 2) {
      intervaloInicio = sorted[0].saida;
      intervaloFim = sorted[1].entrada;
    } else {
      intervaloInicio = fim;
      intervaloFim = fim;
    }
  }

  return {
    inicio,
    fim,
    intervaloInicio,
    intervaloFim,
    totalSemanalMin: carga.totalMinutosSemana,
  };
}
