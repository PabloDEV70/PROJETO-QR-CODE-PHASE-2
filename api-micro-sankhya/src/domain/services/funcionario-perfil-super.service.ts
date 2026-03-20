import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { FuncionarioPerfilService } from './funcionario-perfil.service';
import {
  FuncionarioPerfilSuper,
  GestorInfo,
  CentroResultadoInfo,
  SalarioInfo,
  GestorRow,
  SalarioRow,
} from '../../types/TFPFUN';
import { gestorInfo } from '../../sql-queries/TFPFUN/perfil-super-enriquecido';
import { ultimoSalario } from '../../sql-queries/TFPBAS';

export class FuncionarioPerfilSuperService {
  private qe: QueryExecutor;
  private perfilService: FuncionarioPerfilService;

  constructor() {
    this.qe = new QueryExecutor();
    this.perfilService = new FuncionarioPerfilService();
  }

  async getPerfilSuper(codparc: number): Promise<FuncionarioPerfilSuper | null> {
    // 1. Get base enriched profile
    const perfil = await this.perfilService.getPerfilEnriquecido(codparc);
    if (!perfil) return null;

    // 2. Fetch gestor + salary in parallel (graceful degradation)
    const [gestorData, salarioData] = await Promise.all([
      this.fetchGestor(codparc).catch(() => null),
      this.fetchSalario(perfil.vinculoAtual).catch(() => null),
    ]);

    return {
      ...perfil,
      gestor: gestorData?.gestor ?? null,
      centroResultado: gestorData?.centroResultado ?? null,
      salarioInfo: salarioData,
    };
  }

  private async fetchGestor(codparc: number): Promise<{
    gestor: GestorInfo | null;
    centroResultado: CentroResultadoInfo | null;
  } | null> {
    const sql = gestorInfo.replace(/@codparc/g, codparc.toString());
    const rows = await this.qe.executeQuery<GestorRow>(sql);

    if (rows.length === 0) return null;
    const r = rows[0];

    const centroResultado: CentroResultadoInfo = {
      codcencus: r.codcencus,
      descricao: r.centroResultado,
    };

    const gestor: GestorInfo | null = r.gestorCodusu
      ? {
          codusu: r.gestorCodusu,
          nome: r.gestorNome!,
          email: r.gestorEmail,
          celular: r.gestorCelular,
          cargo: r.gestorCargo,
          departamento: r.gestorDepartamento,
        }
      : null;

    return { gestor, centroResultado };
  }

  private async fetchSalario(
    vinculo: { codemp: number; codfunc: number } | null
  ): Promise<SalarioInfo | null> {
    if (!vinculo) return null;

    const sql = ultimoSalario
      .replace(/@codemp/g, vinculo.codemp.toString())
      .replace(/@codfunc/g, vinculo.codfunc.toString());

    const rows = await this.qe.executeQuery<SalarioRow>(sql);
    if (rows.length === 0) return null;

    const r = rows[0];
    const percentualLiquido =
      r.salBruto > 0 ? Math.round((r.salLiq / r.salBruto) * 10000) / 100 : null;

    return {
      salBase: r.salBase,
      salBruto: r.salBruto,
      salLiq: r.salLiq,
      dtPagamento: r.dtPagamento,
      diasTrabalhados: r.diasTrabalhados,
      referencia: r.referencia,
      tipFolhaDescricao: r.tipFolhaDescricao,
      percentualLiquido,
    };
  }
}
