import type {
  FuncionarioAtivoRaw, HorarioSemanalRaw, AusenciaRaw,
  HorasEsperadasFuncionario, HorasEsperadasResumo,
} from '../../types/HORAS_ESPERADAS';

/** Map: CODCARGAHOR -> Map<DIASEM, minutosDia> */
type ScheduleLookup = Map<number, Map<number, number>>;

/** Map: "CODEMP-CODFUNC" -> Set<"YYYY-MM-DD"> with tipo tracking */
type ExcludedMap = Map<string, { dates: Set<string>; ausencias: AusenciaSummary[] }>;

interface AusenciaSummary { tipo: string; dias: number }

export function buildScheduleLookup(
  horarios: HorarioSemanalRaw[],
): ScheduleLookup {
  const lookup: ScheduleLookup = new Map();
  for (const h of horarios) {
    if (!lookup.has(h.CODCARGAHOR)) {
      lookup.set(h.CODCARGAHOR, new Map());
    }
    lookup.get(h.CODCARGAHOR)!.set(h.DIASEM, Number(h.minutosDia) || 0);
  }
  return lookup;
}

export function buildExcludedDates(
  ausencias: AusenciaRaw[],
  periodoInicio: string,
  periodoFim: string,
): ExcludedMap {
  const map: ExcludedMap = new Map();
  const pIni = new Date(periodoInicio + 'T00:00:00');
  const pFim = new Date(periodoFim + 'T00:00:00');

  for (const a of ausencias) {
    const key = `${a.CODEMP}-${a.CODFUNC}`;
    if (!map.has(key)) {
      map.set(key, { dates: new Set(), ausencias: [] });
    }
    const entry = map.get(key)!;
    const inicio = new Date(a.dtInicio + 'T00:00:00');
    let diasNoPeriodo = 0;

    for (let i = 0; i < a.numDias; i++) {
      const d = new Date(inicio);
      d.setDate(d.getDate() + i);
      if (d >= pIni && d <= pFim) {
        entry.dates.add(toISO(d));
        diasNoPeriodo++;
      }
    }
    if (diasNoPeriodo > 0) {
      entry.ausencias.push({ tipo: a.tipo, dias: diasNoPeriodo });
    }
  }
  return map;
}

export function calcFuncionarioHoras(
  f: FuncionarioAtivoRaw,
  scheduleLookup: ScheduleLookup,
  excludedMap: ExcludedMap,
  holidaySet: Set<string>,
  dataInicio: string,
  dataFim: string,
): HorasEsperadasFuncionario {
  const schedule = scheduleLookup.get(f.CODCARGAHOR!) ?? new Map();
  const excKey = `${f.CODEMP}-${f.CODFUNC}`;
  const excEntry = excludedMap.get(excKey);
  const excDates = excEntry?.dates ?? new Set();

  const admDate = f.DTADM ? f.DTADM.slice(0, 10) : dataInicio;
  const efStart = admDate > dataInicio ? admDate : dataInicio;
  const start = new Date(efStart + 'T00:00:00');
  const end = new Date(dataFim + 'T00:00:00');

  let totalMin = 0;
  let diasUteis = 0;
  let diasExcl = 0;
  const cur = new Date(start);

  while (cur <= end) {
    const iso = toISO(cur);
    // JS getDay: 0=Sun,1=Mon,...6=Sat => SQL DIASEM: 1=Sun,2=Mon,...7=Sat
    const diasem = cur.getDay() + 1;
    const minDia = schedule.get(diasem) ?? 0;

    if (minDia > 0) {
      if (excDates.has(iso) || holidaySet.has(iso)) {
        diasExcl++;
      } else {
        totalMin += minDia;
        diasUteis++;
      }
    }
    cur.setDate(cur.getDate() + 1);
  }

  return {
    codemp: f.CODEMP,
    codfunc: f.CODFUNC,
    codparc: f.CODPARC,
    nomefunc: f.NOMEFUNC,
    coddep: f.CODDEP,
    codcargahor: f.CODCARGAHOR,
    dtadm: admDate,
    diasUteis,
    diasExcluidos: diasExcl,
    minutosEsperados: totalMin,
    horasEsperadas: Math.round(totalMin / 60 * 100) / 100,
    ausencias: excEntry?.ausencias ?? [],
  };
}

export function buildResumo(
  data: HorasEsperadasFuncionario[],
): HorasEsperadasResumo {
  const totalMin = data.reduce((s, d) => s + d.minutosEsperados, 0);
  const totalDU = data.reduce((s, d) => s + d.diasUteis, 0);
  const totalDE = data.reduce((s, d) => s + d.diasExcluidos, 0);
  return {
    totalFuncionarios: data.length,
    totalMinutosEsperados: totalMin,
    totalHorasEsperadas: Math.round(totalMin / 60 * 100) / 100,
    totalDiasUteis: totalDU,
    totalDiasExcluidos: totalDE,
    mediaHorasPorFuncionario: data.length > 0
      ? Math.round(totalMin / 60 / data.length * 100) / 100
      : 0,
  };
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
