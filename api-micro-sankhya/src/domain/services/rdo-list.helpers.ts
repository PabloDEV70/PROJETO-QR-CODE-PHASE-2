import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { RdoListItem } from '../../types/AD_RDOAPONTAMENTOS';
import { cargaDiariaPorCodigo } from '../../sql-queries/TFPHOR';
import { cache } from '../../shared/cache/memory-cache';
import { CACHE_TTL } from '../../shared/cache/cache-ttl';

interface CargaDiaRow {
  diasem: number;
  minutosDia: number;
  folga: number;
}

/** Max parallel carga queries to avoid flooding API Mother */
const BATCH_SIZE = 4;

/** Run promises in batches of `size` */
async function batchAll<T>(tasks: (() => Promise<T>)[], size: number): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += size) {
    const batch = tasks.slice(i, i + size);
    const batchResults = await Promise.all(batch.map((fn) => fn()));
    results.push(...batchResults);
  }
  return results;
}

/**
 * Fetch carga diaria for a single CODCARGAHOR, with 30-min cache.
 */
async function fetchCargaDiaria(
  cod: number,
  queryExecutor: QueryExecutor,
): Promise<Map<number, number>> {
  const cacheKey = `carga-diaria:${cod}`;
  const cached = cache.get<Map<number, number>>(cacheKey);
  if (cached) return cached;

  const sql = cargaDiariaPorCodigo.replace('@codcargahor', cod.toString());
  const rows = await queryExecutor.executeQuery<CargaDiaRow>(sql);
  const diasMap = new Map<number, number>();
  for (const row of rows) {
    diasMap.set(row.diasem, row.minutosDia);
  }
  cache.set(cacheKey, diasMap, CACHE_TTL.CARGA_HORARIA);
  return diasMap;
}

/**
 * Enrich RDO list items with horasJornadaEsperada from TFPHOR.
 * Fetches carga horaria separately and merges in JS
 * (API Mother rejects correlated subqueries).
 */
export async function enrichWithCargaHoraria(
  data: RdoListItem[],
  queryExecutor: QueryExecutor,
): Promise<void> {
  if (data.length === 0) return;

  const codsCarga = [
    ...new Set(
      data.map((r) => r.codcargahor).filter((c): c is number => c != null),
    ),
  ];

  if (codsCarga.length === 0) {
    for (const item of data) {
      item.minutosPrevistosDia = 0;
      item.horasJornadaEsperada = 0;
    }
    return;
  }

  // Fetch in batches of BATCH_SIZE with per-code caching
  const cargaMap = new Map<number, Map<number, number>>();
  const tasks = codsCarga.map((cod) => () => fetchCargaDiaria(cod, queryExecutor));
  const results = await batchAll(tasks, BATCH_SIZE);

  for (let i = 0; i < codsCarga.length; i++) {
    cargaMap.set(codsCarga[i], results[i]);
  }

  // Enrich each item with minutosPrevistosDia
  for (const item of data) {
    if (!item.codcargahor || !item.DTREF) {
      item.minutosPrevistosDia = 480;
      item.horasJornadaEsperada = 8;
      continue;
    }
    // Parse without TZ shift: "2026-02-09T00:00:00.000Z" in BRT shifts to prev day
    const dtStr = String(item.DTREF).slice(0, 10);
    const [y, m, d] = dtStr.split('-').map(Number);
    // JS getDay(): 0=Dom → SQL DATEPART(dw): 1=Dom
    const diasem = new Date(y, m - 1, d).getDay() + 1;
    const diasMap = cargaMap.get(item.codcargahor);
    const minutos = diasMap?.get(diasem);
    if (minutos != null) {
      item.minutosPrevistosDia = minutos;
      item.horasJornadaEsperada = +(minutos / 60).toFixed(1);
    } else {
      item.minutosPrevistosDia = 480;
      item.horasJornadaEsperada = 8;
    }
  }
}
