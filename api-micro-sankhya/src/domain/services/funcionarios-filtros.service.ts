import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  opcoesEmpresas,
  opcoesDepartamentos,
  opcoesCargos,
  opcoesFuncoes,
  opcoesCentrosResultado,
} from '../../sql-queries/TFPFUN/opcoes-filtros';
import { cache, CACHE_TTL } from '../../shared/cache';

interface OpcaoFiltro {
  codigo: number;
  nome: string;
}

export interface FiltrosOpcoes {
  empresas: OpcaoFiltro[];
  departamentos: OpcaoFiltro[];
  cargos: OpcaoFiltro[];
  funcoes: OpcaoFiltro[];
  centrosResultado: OpcaoFiltro[];
}

export class FuncionariosFiltrosService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getOpcoesFiltros(): Promise<FiltrosOpcoes> {
    const key = 'filtros:opcoes';
    const cached = cache.get<FiltrosOpcoes>(key);
    if (cached) return cached;

    const [empresas, departamentos, cargos, funcoes, centrosResultado] =
      await Promise.all([
        this.qe.executeQuery<OpcaoFiltro>(opcoesEmpresas),
        this.qe.executeQuery<OpcaoFiltro>(opcoesDepartamentos),
        this.qe.executeQuery<OpcaoFiltro>(opcoesCargos),
        this.qe.executeQuery<OpcaoFiltro>(opcoesFuncoes),
        this.qe.executeQuery<OpcaoFiltro>(opcoesCentrosResultado).catch(() => []),
      ]);

    const result = { empresas, departamentos, cargos, funcoes, centrosResultado };
    cache.set(key, result, CACHE_TTL.FILTERS);
    return result;
  }
}
