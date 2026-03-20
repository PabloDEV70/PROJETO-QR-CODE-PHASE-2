import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  resumoFuncionarios,
  contarUsuariosFuncionarios,
  totaisPorEmpresa,
  totaisPorDepartamento,
} from '../../sql-queries/TFPFUN';

export interface FuncionariosResumo {
  totalAtivos: number;
  totalDemitidos: number;
  totalAfastados: number;
  totalTransferidos: number;
  totalComUsuario: number;
  totalComFoto: number;
  total: number;
  porEmpresa: EmpresaTotal[];
  porDepartamento: DepartamentoTotal[];
}

interface EmpresaTotal {
  codemp: number;
  nome: string | null;
  total: number;
}

interface DepartamentoTotal {
  coddep: number;
  nome: string | null;
  total: number;
}

interface ResumoRow {
  totalAtivos: number;
  totalDemitidos: number;
  totalAfastados: number;
  totalTransferidos: number;
  totalComFoto: number;
  total: number;
}

interface UsuarioCountRow {
  totalComUsuario: number;
}

interface EmpresaRow {
  codemp: number;
  nome: string | null;
  total: number;
}

interface DepartamentoRow {
  coddep: number;
  nome: string | null;
  total: number;
}

export class FuncionariosResumoService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getResumo(): Promise<FuncionariosResumo> {
    const [resumoRows, usuarioRows, empresaRows, deptRows] = await Promise.all([
      this.queryExecutor.executeQuery<ResumoRow>(resumoFuncionarios),
      this.queryExecutor.executeQuery<UsuarioCountRow>(contarUsuariosFuncionarios),
      this.queryExecutor.executeQuery<EmpresaRow>(totaisPorEmpresa),
      this.queryExecutor.executeQuery<DepartamentoRow>(totaisPorDepartamento),
    ]);

    const resumo = resumoRows[0] || {
      totalAtivos: 0,
      totalDemitidos: 0,
      totalAfastados: 0,
      totalTransferidos: 0,
      totalComFoto: 0,
      total: 0,
    };

    const totalComUsuario = usuarioRows[0]?.totalComUsuario ?? 0;

    return {
      totalAtivos: resumo.totalAtivos,
      totalDemitidos: resumo.totalDemitidos,
      totalAfastados: resumo.totalAfastados,
      totalTransferidos: resumo.totalTransferidos,
      totalComUsuario,
      totalComFoto: resumo.totalComFoto,
      total: resumo.total,
      porEmpresa: empresaRows.map((row) => ({
        codemp: row.codemp,
        nome: row.nome,
        total: row.total,
      })),
      porDepartamento: deptRows.map((row) => ({
        coddep: row.coddep,
        nome: row.nome,
        total: row.total,
      })),
    };
  }
}
