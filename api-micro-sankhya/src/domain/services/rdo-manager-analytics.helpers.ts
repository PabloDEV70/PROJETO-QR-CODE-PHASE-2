import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { RdoListItem, RdoAnalyticsOptions } from '../../types/AD_RDOAPONTAMENTOS';
import { buildWhere } from './rdo-query-helpers';
import { enrichWithCargaHoraria } from './rdo-list.helpers';
import { enrichWithProdutividade } from './rdo-produtividade.helpers';
import { analyticsAllRdos } from '../../sql-queries/AD_RDOAPONTAMENTOS';

/** Raw row from analytics-all-rdos query (before enrichment) */
interface AllRdosRawRow {
  CODRDO: number;
  CODPARC: number | null;
  DTREF: Date | null;
  nomeparc: string | null;
  departamento: string | null;
  cargo: string | null;
  coddep: number | null;
  totalItens: number;
  totalMinutos: number;
  primeiraHora: string | null;
  ultimaHora: string | null;
  codcargahor: number | null;
}

/**
 * Fetch all RDO items in period (no pagination, max 3000),
 * enriched with carga horaria + produtividade.
 */
export async function fetchAllRdoItems(
  options: RdoAnalyticsOptions,
  queryExecutor: QueryExecutor,
): Promise<(RdoListItem & { coddep?: number | null })[]> {
  const where = buildWhere(options);
  const sql = analyticsAllRdos.replace('-- @WHERE', where);

  const rawRows = await queryExecutor.executeQuery<AllRdosRawRow>(sql);

  // Cast to RdoListItem shape (missing fields will be filled by enrichment)
  const items = rawRows.map((r) => ({
    ...r,
    totalHoras: r.totalMinutos / 60,
    qtdOs: 0,
    primeiroNuos: null,
    osStatus: null,
    osManutencao: null,
    osStatusGig: null,
    osDataIni: null,
    osPrevisao: null,
    osQtdServicos: null,
    veiculoPlaca: null,
    veiculoTag: null,
    veiculoModelo: null,
    minutosPrevistosDia: 0,
    horasJornadaEsperada: 0,
    minutosProdu: 0,
    minutosNaoProdu: 0,
    minutosFumarPenalidade: 0,
    produtividadePercent: 0,
    atingiuMeta: false,
    metaEfetivaMin: 0,
    totalBrutoMin: 0,
    almocoQtd: 0,
    almocoMin: 0,
    almocoDescontadoMin: 0,
    banheiroQtd: 0,
    banheiroMin: 0,
    banheiroDescontadoMin: 0,
    fumarQtd: 0,
    fumarMinReal: 0,
    intervaloAlmocoMin: 0,
    horaExtraMin: 0,
    minutosContabilizados: 0,
    tempoNoTrabalho: 0,
    saldoJornadaMin: 0,
    diagnostico: '',
    motivoMinutos: {},
  })) as (RdoListItem & { coddep?: number | null })[];

  await enrichWithCargaHoraria(items, queryExecutor);
  await enrichWithProdutividade(items, queryExecutor);

  return items;
}
