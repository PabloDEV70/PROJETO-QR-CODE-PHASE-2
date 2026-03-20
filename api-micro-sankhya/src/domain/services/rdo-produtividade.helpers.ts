import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { RdoListItem, PRODUTIVIDADE_MODE } from '../../types/AD_RDOAPONTAMENTOS';
import { MotivoConfigService } from './motivo-config.service';
import { resumoMotivosPorRdo } from '../../sql-queries/AD_RDOAPONTAMENTOS';
import {
  calcProdutividade,
  buildIntervaloMap,
  calcIntervaloAlmoco,
  TurnoRow,
} from './rdo-produtividade-calc';
import { buildWtCategorias } from './rdo-wt-categories';
import { buildDiagnostico, buildTolerancias } from './rdo-diagnostico';
import { buildJornada } from './rdo-jornada';
import { buildMotivosConfig } from './rdo-motivos-config';

// Re-export for consumers that import from this file
export { calcIntervaloAlmoco, TurnoRow } from './rdo-produtividade-calc';

interface MotivoResumoRow {
  codrdo: number;
  rdomotivocod: number;
  qtdRegistros: number;
  totalMinutos: number;
}

/**
 * Enrich RDO list items with produtividade metrics.
 * Fetches detalhes agrupados por motivo e calcula produtividade por RDO.
 */
export async function enrichWithProdutividade(
  data: RdoListItem[],
  queryExecutor: QueryExecutor,
): Promise<void> {
  if (data.length === 0) return;

  const configService = new MotivoConfigService();
  const configMap = await configService.getConfigMap();

  const codrdos = data.map((r) => r.CODRDO);
  const sql = resumoMotivosPorRdo(codrdos);
  const rows = await queryExecutor.executeQuery<MotivoResumoRow>(sql);

  // Group by CODRDO
  const byRdo = new Map<number, MotivoResumoRow[]>();
  for (const row of rows) {
    const list = byRdo.get(row.codrdo) || [];
    list.push(row);
    byRdo.set(row.codrdo, list);
  }

  // Build intervalo almoco map: codcargahor+diasem -> minutes
  const intervaloMap = await buildIntervaloMap(data, queryExecutor);

  // motivosConfig is computed ONCE per request (same config for all items)
  const motivosConfigEmbutido = buildMotivosConfig(configMap);

  const mode = PRODUTIVIDADE_MODE;

  for (const item of data) {
    const motivos = byRdo.get(item.CODRDO) || [];
    // Parse without TZ shift: "2026-02-09T00:00:00.000Z" in BRT would shift to prev day
    let diasem = 0;
    if (item.DTREF) {
      const [y, mo, d] = String(item.DTREF).slice(0, 10).split('-').map(Number);
      diasem = new Date(y, mo - 1, d).getDay() + 1;
    }
    const intervaloAlmoco = intervaloMap.get(`${item.codcargahor}-${diasem}`) ?? 60;

    const result = calcProdutividade(
      motivos, item.minutosPrevistosDia, intervaloAlmoco, mode, configMap,
    );
    Object.assign(item, result);
    item.wtCategorias = buildWtCategorias(result, configMap);
    item.diagnosticoFaixa = buildDiagnostico(result);
    item.tolerancias = buildTolerancias(result, configMap);
    item.jornada = buildJornada(result, item.minutosPrevistosDia);
    item.motivosConfig = motivosConfigEmbutido;
    // HJE = jornada completa COM almoco (ex: 9h, nao 8h)
    item.horasJornadaEsperada = +((item.minutosPrevistosDia + intervaloAlmoco) / 60).toFixed(1);
  }
}
