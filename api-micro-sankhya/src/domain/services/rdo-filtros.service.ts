import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  RdoFiltroOpcao,
  RdoFiltrosOpcoes,
  RdoAnalyticsOptions,
} from '../../types/AD_RDOAPONTAMENTOS';
import { buildWhere } from './rdo-query-helpers';
import * as Q from '../../sql-queries/AD_RDOAPONTAMENTOS';

export class RdoFiltrosService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getOpcoesFiltros(
    options: Pick<RdoAnalyticsOptions, 'dataInicio' | 'dataFim'>,
  ): Promise<RdoFiltrosOpcoes> {
    const where = buildWhere(options);

    const [departamentos, cargos, funcoes, empresas] = await Promise.all([
      this.qe.executeQuery<RdoFiltroOpcao>(
        Q.filtrosDepartamentos.replace('-- @WHERE', where),
      ),
      this.qe.executeQuery<RdoFiltroOpcao>(
        Q.filtrosCargos.replace('-- @WHERE', where),
      ),
      this.qe.executeQuery<RdoFiltroOpcao>(
        Q.filtrosFuncoes.replace('-- @WHERE', where),
      ),
      this.qe.executeQuery<RdoFiltroOpcao>(
        Q.filtrosEmpresas.replace('-- @WHERE', where),
      ),
    ]);

    return { departamentos, cargos, funcoes, empresas };
  }
}
