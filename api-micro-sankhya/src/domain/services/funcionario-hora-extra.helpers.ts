import {
  HoraExtraDia,
  HoraExtraItem,
  HoraExtraResumo,
} from '../../types/TFPFUN';
import { formatHorario, formatMinutosParaHoras } from '../../shared/utils/sankhya-formatters';
import { labelDiaSemana } from '../../shared/constants/dias-semana';

export interface FuncionarioRow {
  codemp: number; codfunc: number; codparc: number;
  nomeparc: string; cgcCpf: string | null;
  telefone: string | null; email: string | null;
  situacao: string; dtadm: string; dtdem: string | null;
  codcargahor: number | null; salario: number | null;
  codcargo: number | null; cargo: string | null;
  codfuncao: number | null; funcao: string | null;
  coddep: number | null; departamento: string | null;
  empresa: string | null;
}

export interface CargaDiaRow {
  diasem: number; minutosDia: number; folga: number;
}

export interface ApontamentoRow {
  dtref: string; diasem: number; item: number;
  hrini: number; hrfim: number; duracaoMinutos: number;
  rdomotivocod: number | null;
  motivoDescricao: string | null; motivoSigla: string | null;
  nuos: number | null; obs: string | null;
}

type CargaMap = Map<number, { minutos: number; folga: boolean }>;

function mapItem(r: ApontamentoRow): HoraExtraItem {
  return {
    item: r.item, hrini: r.hrini, hrfim: r.hrfim,
    hriniFormatada: formatHorario(r.hrini) || '',
    hrfimFormatada: formatHorario(r.hrfim) || '',
    duracaoMinutos: Number(r.duracaoMinutos),
    motivoDescricao: r.motivoDescricao,
    motivoSigla: r.motivoSigla,
    nuos: r.nuos, obs: r.obs,
  };
}

export function agruparPorDia(
  rows: ApontamentoRow[], cargaDia: CargaMap,
): HoraExtraDia[] {
  const map = new Map<string, { diasem: number; itens: ApontamentoRow[] }>();
  for (const r of rows) {
    const key = String(r.dtref).substring(0, 10);
    const entry = map.get(key);
    if (!entry) {
      map.set(key, { diasem: Number(r.diasem), itens: [r] });
    } else {
      entry.itens.push(r);
    }
  }

  const result: HoraExtraDia[] = [];
  for (const [dtref, { diasem, itens }] of map) {
    const carga = cargaDia.get(diasem);
    const previsto = carga ? carga.minutos : 0;
    const folga = carga ? carga.folga : true;
    const apontados = itens.reduce(
      (s, i) => s + Number(i.duracaoMinutos), 0,
    );
    const extra = Math.max(0, apontados - previsto);
    const pctJornada = previsto > 0
      ? Math.round(apontados / previsto * 10000) / 100 : 0;

    result.push({
      dtref, diasem, diasemLabel: labelDiaSemana(diasem),
      minutosPrevistos: previsto, minutosApontados: apontados,
      minutosHoraExtra: folga ? apontados : extra,
      horasHoraExtraFmt: formatMinutosParaHoras(folga ? apontados : extra),
      folga, percentualJornada: pctJornada,
      itens: itens.map(mapItem),
    });
  }

  return result;
}

export function buildMeta(dias: HoraExtraDia[]): HoraExtraResumo {
  const totalPrev = dias.reduce((s, d) => s + d.minutosPrevistos, 0);
  const totalApont = dias.reduce((s, d) => s + d.minutosApontados, 0);
  const totalExtra = dias.reduce((s, d) => s + d.minutosHoraExtra, 0);

  return {
    totalDias: dias.length,
    totalMinutosPrevistos: totalPrev,
    totalMinutosApontados: totalApont,
    totalMinutosHoraExtra: totalExtra,
    totalHorasHoraExtraFmt: formatMinutosParaHoras(totalExtra),
    mediaMinutosDia: dias.length > 0
      ? Math.round(totalApont / dias.length) : 0,
    diasComHoraExtra: dias.filter((d) => d.minutosHoraExtra > 0).length,
    diasEmFolga: dias.filter((d) => d.folga).length,
  };
}
