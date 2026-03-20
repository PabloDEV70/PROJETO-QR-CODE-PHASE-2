import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { RdoListItem, MOTIVO_ALMOCO } from '../../types/AD_RDOAPONTAMENTOS';
import { MotivoConfigMap } from '../../types/AD_RDOMOTIVOS';
import { cargaHoraria as cargaHorariaQuery } from '../../sql-queries/TFPHOR';
import { cache } from '../../shared/cache/memory-cache';
import { CACHE_TTL } from '../../shared/cache/cache-ttl';

interface MotivoResumoRow {
  codrdo: number;
  rdomotivocod: number;
  qtdRegistros: number;
  totalMinutos: number;
}

export interface TurnoRow {
  codcargahor: number;
  diasem: number;
  turno: number;
  entrada: number | null;
  saida: number | null;
}

export interface ProdResult {
  minutosProdu: number;
  minutosNaoProdu: number;
  minutosFumarPenalidade: number;
  produtividadePercent: number;
  atingiuMeta: boolean;
  metaEfetivaMin: number;
  totalBrutoMin: number;
  almocoQtd: number;
  almocoMin: number;
  almocoDescontadoMin: number;
  banheiroQtd: number;
  banheiroMin: number;
  banheiroDescontadoMin: number;
  fumarQtd: number;
  fumarMinReal: number;
  intervaloAlmocoMin: number;
  horaExtraMin: number;
  minutosContabilizados: number;
  tempoNoTrabalho: number;
  saldoJornadaMin: number;
  diagnostico: string;
  motivoMinutos: Record<number, number>;
}

/** Calcula gap entre turnos (intervalo intrajornada/almoco) para um DIASEM */
export function calcIntervaloAlmoco(turnos: TurnoRow[]): number {
  const validos = turnos.filter((t) => t.entrada != null && t.saida != null);
  if (validos.length < 2) return 0;
  const sorted = validos.sort((a, b) => a.entrada! - b.entrada!);
  let gap = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prevFim = Math.floor(sorted[i - 1].saida! / 100) * 60 + (sorted[i - 1].saida! % 100);
    const currIni = Math.floor(sorted[i].entrada! / 100) * 60 + (sorted[i].entrada! % 100);
    if (currIni > prevFim) gap += currIni - prevFim;
  }
  return gap;
}

// SYNC: manter identico ao frontend (diagnostico-faixas.ts)
export function getDiagnosticoBackend(pct: number, horaExtraMin?: number): string {
  const label = pct >= 95 ? 'Na meta'
    : pct >= 85 ? 'Quase la'
      : pct >= 70 ? 'Atencao' : 'Critico';
  return horaExtraMin && horaExtraMin > 0 ? `${label} (com HE)` : label;
}

export function calcProdutividade(
  motivos: MotivoResumoRow[],
  minutosPrevistos: number,
  intervaloAlmoco: number,
  mode: 'AMPLO' | 'ESTRITO',
  configMap: MotivoConfigMap,
): ProdResult {
  // DB-driven tolerances with legacy fallbacks
  const almocoTolExtra = configMap.get(MOTIVO_ALMOCO)?.toleranciaMin ?? 10;
  const banheiroTol = configMap.get(2)?.toleranciaMin ?? 10; // cod 2 = banheiro

  let minutosProdu = 0;
  let minutosAlmoco = 0;
  let minutosBanheiro = 0;
  let minutosFumarPenalidade = 0;
  let minutosOutros = 0;
  let totalBruto = 0;
  let almocoQtd = 0;
  let banheiroQtd = 0;
  let fumarQtd = 0;
  let fumarMinReal = 0;
  const motivoMinutos: Record<number, number> = {};

  for (const m of motivos) {
    const cfg = configMap.get(m.rdomotivocod);
    motivoMinutos[m.rdomotivocod] = (motivoMinutos[m.rdomotivocod] || 0) + m.totalMinutos;
    totalBruto += m.totalMinutos;
    if (m.rdomotivocod === MOTIVO_ALMOCO) {
      minutosAlmoco += m.totalMinutos;
      almocoQtd += m.qtdRegistros;
    } else if ((cfg?.toleranciaMin ?? 0) > 0 && m.rdomotivocod !== MOTIVO_ALMOCO) {
      minutosBanheiro += m.totalMinutos;
      banheiroQtd += m.qtdRegistros;
    } else if ((cfg?.penalidadeMin ?? 0) > 0) {
      minutosFumarPenalidade += m.qtdRegistros * (cfg?.penalidadeMin ?? 0);
      fumarQtd += m.qtdRegistros;
      fumarMinReal += m.totalMinutos;
    } else if (mode === 'ESTRITO') {
      if (cfg?.produtivo) {
        minutosProdu += m.totalMinutos;
      } else {
        minutosOutros += m.totalMinutos;
      }
    } else {
      minutosProdu += m.totalMinutos;
    }
  }

  const teto = intervaloAlmoco + almocoTolExtra;
  const almocoDescontado = Math.min(minutosAlmoco, teto);
  const banheiroDescontado = Math.min(minutosBanheiro, banheiroTol);
  const minutosProduEfetivos = Math.max(minutosProdu - minutosFumarPenalidade, 0);

  // Tempo no trabalho = total bruto - almoco (primeiro ao ultimo apontamento sem almoco)
  const tempoNoTrabalho = totalBruto - almocoDescontado;
  const minutosContabilizados = tempoNoTrabalho - banheiroDescontado;
  const horaExtraMin = minutosPrevistos > 0
    ? Math.max(tempoNoTrabalho - minutosPrevistos, 0) : 0;
  const saldoJornadaMin = minutosPrevistos > 0
    ? tempoNoTrabalho - minutosPrevistos : 0;

  // Produtividade = produtivo / tempo no trabalho (nao mais baseado na jornada)
  const metaEfetiva = tempoNoTrabalho;
  const produtividadePercent = tempoNoTrabalho > 0
    ? Math.min(Math.floor((minutosProduEfetivos / tempoNoTrabalho) * 100), 100)
    : 0;
  const atingiuMeta = produtividadePercent >= 85;
  const diagnostico = getDiagnosticoBackend(produtividadePercent, horaExtraMin);

  return {
    minutosProdu: minutosProduEfetivos,
    minutosNaoProdu: minutosOutros + minutosBanheiro,
    minutosFumarPenalidade,
    produtividadePercent,
    atingiuMeta,
    metaEfetivaMin: metaEfetiva,
    totalBrutoMin: totalBruto,
    almocoQtd, almocoMin: minutosAlmoco, almocoDescontadoMin: almocoDescontado,
    banheiroQtd, banheiroMin: minutosBanheiro, banheiroDescontadoMin: banheiroDescontado,
    fumarQtd, fumarMinReal,
    intervaloAlmocoMin: intervaloAlmoco,
    horaExtraMin,
    minutosContabilizados,
    tempoNoTrabalho,
    saldoJornadaMin,
    diagnostico,
    motivoMinutos,
  };
}

/** Max parallel carga queries */
const BATCH_SIZE = 4;

/** Fetch turno rows for a single codcargahor, cached 30 min */
async function fetchTurnos(
  cod: number,
  queryExecutor: QueryExecutor,
): Promise<TurnoRow[]> {
  const cacheKey = `carga-turnos:${cod}`;
  const cached = cache.get<TurnoRow[]>(cacheKey);
  if (cached) return cached;

  const sql = cargaHorariaQuery.replace('@codcargahor', cod.toString());
  const rows = await queryExecutor.executeQuery<TurnoRow>(sql);
  cache.set(cacheKey, rows, CACHE_TTL.CARGA_HORARIA);
  return rows;
}

/** Build map of codcargahor-diasem -> intervaloAlmoco (minutes) */
export async function buildIntervaloMap(
  data: RdoListItem[],
  queryExecutor: QueryExecutor,
): Promise<Map<string, number>> {
  const codsCarga = [
    ...new Set(data.map((r) => r.codcargahor).filter((c): c is number => c != null)),
  ];
  const map = new Map<string, number>();
  if (codsCarga.length === 0) return map;

  // Fetch in batches to avoid flooding API Mother
  const allResults: { cod: number; rows: TurnoRow[] }[] = [];
  for (let i = 0; i < codsCarga.length; i += BATCH_SIZE) {
    const batch = codsCarga.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (cod) => {
        const rows = await fetchTurnos(cod, queryExecutor);
        return { cod, rows };
      }),
    );
    allResults.push(...batchResults);
  }

  for (const { cod, rows } of allResults) {
    const byDia = new Map<number, TurnoRow[]>();
    for (const row of rows) {
      const list = byDia.get(row.diasem) || [];
      list.push(row);
      byDia.set(row.diasem, list);
    }
    for (const [diasem, turnos] of byDia) {
      const intervalo = calcIntervaloAlmoco(turnos);
      map.set(`${cod}-${diasem}`, intervalo || 60);
    }
  }
  return map;
}
