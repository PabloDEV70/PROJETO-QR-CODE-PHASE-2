import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString } from '../../shared/sql-sanitize';
import { labelSituacao } from '../../shared/utils/sankhya-formatters';
import {
  listarFuncionarios,
  contarFuncionarios,
} from '../../sql-queries/TFPFUN';

export interface ListarFuncionariosParams {
  page?: number;
  limit?: number;
  situacao?: string; // '1' = ativo, '0' = inativo, '2' = afastado, undefined = todos
  codemp?: number;
  coddep?: number;
  codcargo?: number;
  codfuncao?: number;
  termo?: string;
  comUsuario?: boolean; // Filtrar apenas quem tem login no sistema (TSIUSU)
  temFoto?: boolean; // Filtrar apenas quem tem foto
  dataInicio?: string; // yyyy-MM-dd — filtra DTADM >= (admitidos no periodo)
  dataFim?: string; // yyyy-MM-dd — filtra DTADM <= (admitidos no periodo)
  orderBy?: 'nomeparc' | 'codparc' | 'cargo' | 'departamento' | 'dtadm' | 'idade' | 'diasNaEmpresa';
  orderDir?: 'ASC' | 'DESC';
}

export interface FuncionarioListaItem {
  codparc: number;
  nomeparc: string;
  cgcCpf: string | null;
  codfunc: number;
  codemp: number;
  situacao: string;
  situacaoLabel: string;
  dtadm: string | null;
  dtnasc: string | null;
  idade: number | null;
  diasNaEmpresa: number | null;
  cargo: string | null;
  coddep: number | null;
  departamento: string | null;
  empresa: string | null;
  temFoto: boolean;
  temUsuario: boolean;
  temArmario: boolean;
  dtAfastamento: string | null;
  causaAfastamento: number | null;
  feriasInicio: string | null;
  feriasDias: number | null;
  emFerias: boolean;
  cliente: string | null;
  fornecedor: string | null;
}

export interface ListarFuncionariosResult {
  data: FuncionarioListaItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ListaRow {
  codparc: number;
  nomeparc: string;
  cgcCpf: string | null;
  codfunc: number;
  codemp: number;
  situacao: string;
  dtadm: string | null;
  dtnasc: string | null;
  idade: number | null;
  diasNaEmpresa: number | null;
  cargo: string | null;
  coddep: number | null;
  departamento: string | null;
  empresa: string | null;
  temFoto: number;
  temUsuario: number;
  temArmario: number;
  dtAfastamento: string | null;
  causaAfastamento: number | null;
  feriasInicio: string | null;
  feriasDias: number | null;
  cliente: string | null;
  fornecedor: string | null;
}

interface CountRow {
  total: number;
}

export class FuncionariosListaService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async listar(params: ListarFuncionariosParams): Promise<ListarFuncionariosResult> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(500, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;
    const orderBy = this.buildOrderBy(params.orderBy, params.orderDir);
    const whereClause = this.buildWhereClause(params);

    // Parallel queries for data and count
    const [rows, countRows] = await Promise.all([
      this.executeListQuery(offset, limit, orderBy, whereClause),
      this.executeCountQuery(whereClause),
    ]);

    const total = countRows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: rows.map(this.mapRow),
      meta: { total, page, limit, totalPages },
    };
  }

  private async executeListQuery(
    offset: number,
    limit: number,
    orderBy: string,
    whereClause: string
  ): Promise<ListaRow[]> {
    const sql = listarFuncionarios
      .replace(/@offset/g, offset.toString())
      .replace(/@limit/g, limit.toString())
      .replace(/@orderBy/g, orderBy)
      .replace(/@whereClause/g, whereClause);

    return this.queryExecutor.executeQuery<ListaRow>(sql);
  }

  private async executeCountQuery(whereClause: string): Promise<CountRow[]> {
    const sql = contarFuncionarios.replace(/@whereClause/g, whereClause);
    return this.queryExecutor.executeQuery<CountRow>(sql);
  }

  private buildWhereClause(params: ListarFuncionariosParams): string {
    const conditions: string[] = [];

    if (params.situacao) {
      conditions.push(`AND fun.SITUACAO = '${params.situacao}'`);
    }
    if (params.codemp) {
      conditions.push(`AND fun.CODEMP = ${params.codemp}`);
    }
    if (params.coddep) {
      conditions.push(`AND fun.CODDEP = ${params.coddep}`);
    }
    if (params.codcargo) {
      conditions.push(`AND fun.CODCARGO = ${params.codcargo}`);
    }
    if (params.codfuncao) {
      conditions.push(`AND fun.CODFUNCAO = ${params.codfuncao}`);
    }
    if (params.comUsuario === true) {
      conditions.push(`AND EXISTS (
        SELECT 1 FROM TSIUSU u
        WHERE u.CODPARC = par.CODPARC
          AND (u.DTLIMACESSO IS NULL OR u.DTLIMACESSO > GETDATE())
      )`);
    }
    if (params.temFoto === true) {
      conditions.push(`AND fun.IMAGEM IS NOT NULL`);
    } else if (params.temFoto === false) {
      conditions.push(`AND fun.IMAGEM IS NULL`);
    }
    if (params.termo) {
      const sanitized = escapeSqlString(params.termo.substring(0, 100));
      conditions.push(`AND (
        par.NOMEPARC LIKE '%${sanitized}%'
        OR CAST(par.CODPARC AS VARCHAR) = '${sanitized}'
        OR par.CGC_CPF LIKE '%${sanitized}%'
      )`);
    }
    if (params.dataInicio) {
      conditions.push(`AND fun.DTADM >= '${params.dataInicio}'`);
    }
    if (params.dataFim) {
      conditions.push(`AND fun.DTADM <= '${params.dataFim} 23:59:59'`);
    }

    return conditions.join(' ');
  }

  private buildOrderBy(
    orderBy?: string,
    orderDir?: string
  ): string {
    const dir = orderDir === 'DESC' ? 'DESC' : 'ASC';
    const columnMap: Record<string, string> = {
      nomeparc: 'par.NOMEPARC',
      codparc: 'par.CODPARC',
      cargo: 'car.DESCRCARGO',
      departamento: 'dep.DESCRCENCUS',
      dtadm: 'fun.DTADM',
      idade: 'fun.DTNASC',
      diasNaEmpresa: 'fun.DTADM',
    };
    const column = columnMap[orderBy || 'nomeparc'] || 'par.NOMEPARC';
    return `${column} ${dir}`;
  }

  private isEmFerias(feriasInicio: string | null, feriasDias: number | null): boolean {
    if (!feriasInicio || !feriasDias) return false;
    const inicio = new Date(feriasInicio + 'T00:00:00');
    const fim = new Date(inicio.getTime() + feriasDias * 86_400_000);
    const hoje = new Date();
    return inicio <= hoje && fim >= hoje;
  }

  private mapRow = (row: ListaRow): FuncionarioListaItem => {
    return {
      codparc: row.codparc,
      nomeparc: row.nomeparc,
      cgcCpf: row.cgcCpf,
      codfunc: row.codfunc,
      codemp: row.codemp,
      situacao: row.situacao,
      situacaoLabel: labelSituacao(row.situacao),
      dtadm: row.dtadm,
      dtnasc: row.dtnasc,
      idade: row.idade,
      diasNaEmpresa: row.diasNaEmpresa,
      cargo: row.cargo,
      coddep: row.coddep ?? null,
      departamento: row.departamento,
      empresa: row.empresa,
      temFoto: row.temFoto === 1,
      temUsuario: row.temUsuario === 1,
      temArmario: row.temArmario === 1,
      dtAfastamento: row.dtAfastamento,
      causaAfastamento: row.causaAfastamento,
      feriasInicio: row.feriasInicio,
      feriasDias: row.feriasDias,
      emFerias: this.isEmFerias(row.feriasInicio, row.feriasDias),
      cliente: row.cliente,
      fornecedor: row.fornecedor,
    };
  }
}
