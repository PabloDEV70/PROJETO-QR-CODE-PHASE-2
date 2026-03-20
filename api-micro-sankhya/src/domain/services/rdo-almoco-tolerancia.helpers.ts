import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { calcIntervaloAlmoco, TurnoRow } from './rdo-produtividade.helpers';
import { cargaHoraria as cargaHorariaQuery } from '../../sql-queries/TFPHOR';
import { getAlmocoPorColaborador } from '../../sql-queries/AD_RDOAPONTAMENTOS';

interface AlmocoRow {
  codparc: number;
  codcargahor: number | null;
  diasem: number;
  qtdOcorrencias: number;
  totalMinutos: number;
}

/**
 * Calculates the total scheduled lunch tolerance (in minutes) for
 * all collaborators in the filtered dataset. Each occurrence is
 * multiplied by the scheduled intervalo from TFPHOR for that
 * codcargahor+diasem.
 */
export async function calcToleranciaAlmoco(
  whereSql: string,
  queryExecutor: QueryExecutor,
): Promise<number> {
  const sql = getAlmocoPorColaborador.replace('-- @WHERE', whereSql);
  const almocoRows = await queryExecutor.executeQuery<AlmocoRow>(sql);
  if (almocoRows.length === 0) return 0;

  const codsCarga = [
    ...new Set(
      almocoRows.map((r) => r.codcargahor).filter((c): c is number => c != null),
    ),
  ];

  const intervaloMap = new Map<string, number>();
  if (codsCarga.length > 0) {
    const results = await Promise.all(
      codsCarga.map(async (cod) => {
        const turnoSql = cargaHorariaQuery.replace('@codcargahor', cod.toString());
        return { cod, rows: await queryExecutor.executeQuery<TurnoRow>(turnoSql) };
      }),
    );
    for (const { cod, rows: turnoRows } of results) {
      const byDia = new Map<number, TurnoRow[]>();
      for (const row of turnoRows) {
        const list = byDia.get(row.diasem) || [];
        list.push(row);
        byDia.set(row.diasem, list);
      }
      for (const [diasem, turnos] of byDia) {
        intervaloMap.set(`${cod}-${diasem}`, calcIntervaloAlmoco(turnos) || 60);
      }
    }
  }

  let total = 0;
  for (const row of almocoRows) {
    const key = `${row.codcargahor}-${row.diasem}`;
    const intervalo = intervaloMap.get(key) ?? 60;
    total += intervalo * Number(row.qtdOcorrencias);
  }
  return total;
}
