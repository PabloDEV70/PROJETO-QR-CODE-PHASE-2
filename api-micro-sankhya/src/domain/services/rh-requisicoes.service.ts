import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString } from '../../shared/sql-sanitize';
import {
  listarRequisicoes,
  contarRequisicoes,
  detalheRequisicao,
} from '../../sql-queries/TFPREQ';
import {
  ListarRequisicoesParams,
  ListarRequisicoesResult,
  RequisicaoRow,
  CountRow,
  RequisicaoRh,
} from '../../types/TFPREQ';

export class RhRequisicoesService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async listar(params: ListarRequisicoesParams): Promise<ListarRequisicoesResult> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;
    const orderBy = this.buildOrderBy(params.orderBy, params.orderDir);
    const whereClause = this.buildWhereClause(params);

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

  async getById(id: number): Promise<RequisicaoRh | null> {
    const sql = detalheRequisicao.replace(/@id/g, id.toString());
    const rows = await this.queryExecutor.executeQuery<RequisicaoRow>(sql);
    if (!rows.length) return null;
    return this.mapRow(rows[0]);
  }

  private async executeListQuery(
    offset: number,
    limit: number,
    orderBy: string,
    whereClause: string,
  ): Promise<RequisicaoRow[]> {
    const sql = listarRequisicoes
      .replace(/@offset/g, offset.toString())
      .replace(/@limit/g, limit.toString())
      .replace(/@orderBy/g, orderBy)
      .replace(/@whereClause/g, whereClause);
    return this.queryExecutor.executeQuery<RequisicaoRow>(sql);
  }

  private async executeCountQuery(whereClause: string): Promise<CountRow[]> {
    const sql = contarRequisicoes.replace(/@whereClause/g, whereClause);
    return this.queryExecutor.executeQuery<CountRow>(sql);
  }

  private buildWhereClause(params: ListarRequisicoesParams): string {
    const conditions: string[] = [];

    if (params.origemTipo) {
      conditions.push(`AND REQ.ORIGEMTIPO = '${params.origemTipo}'`);
    }
    if (params.status !== undefined) {
      conditions.push(`AND REQ.STATUS = ${params.status}`);
    }
    if (params.codemp) {
      conditions.push(`AND REQ.CODEMP = ${params.codemp}`);
    }
    if (params.codfunc) {
      conditions.push(`AND REQ.CODFUNC = ${params.codfunc}`);
    }
    if (params.coddep) {
      conditions.push(`AND FUN.CODDEP = ${params.coddep}`);
    }
    if (params.codcargo) {
      conditions.push(`AND FUN.CODCARGO = ${params.codcargo}`);
    }
    if (params.codfuncao) {
      conditions.push(`AND FUN.CODFUNCAO = ${params.codfuncao}`);
    }
    if (params.dataInicio) {
      conditions.push(`AND REQ.DTCRIACAO >= '${params.dataInicio}'`);
    }
    if (params.dataFim) {
      conditions.push(`AND REQ.DTCRIACAO <= '${params.dataFim}'`);
    }
    if (params.termo) {
      const sanitized = escapeSqlString(params.termo.substring(0, 100));
      conditions.push(`AND (
        FUN.NOMEFUNC LIKE '%${sanitized}%'
        OR ADM.NOMEFUNC LIKE '%${sanitized}%'
        OR REQ.OBSERVACAO LIKE '%${sanitized}%'
        OR CAST(REQ.ID AS VARCHAR) = '${sanitized}'
      )`);
    }

    return conditions.join(' ');
  }

  private buildOrderBy(orderBy?: string, orderDir?: string): string {
    const dir = orderDir === 'ASC' ? 'ASC' : 'DESC';
    const columnMap: Record<string, string> = {
      dtCriacao: 'REQ.DTCRIACAO',
      status: 'REQ.STATUS',
      origemTipo: 'REQ.ORIGEMTIPO',
      nomeFuncionario: 'FUN.NOMEFUNC',
    };
    const column = columnMap[orderBy || 'dtCriacao'] || 'REQ.DTCRIACAO';
    return `${column} ${dir}`;
  }

  private mapRow(row: RequisicaoRow): RequisicaoRh {
    return {
      id: row.id,
      dtCriacao: row.dtCriacao,
      status: row.status,
      statusLabel: row.statusLabel,
      origemTipo: row.origemTipo,
      origemTipoLabel: row.origemTipoLabel,
      codemp: row.codemp,
      codfunc: row.codfunc,
      codparc: row.codparc,
      observacao: row.observacao,
      prioridade: row.prioridade,
      dtLimite: row.dtLimite,
      origemId: row.origemId,
      codusu: row.codusu,
      nomeFuncionario: row.nomeFuncionario,
      nomeEmpresa: row.nomeEmpresa,
      descricaoCargo: row.descricaoCargo,
      departamento: row.departamento,
      funcao: row.funcao,
      nomeSolicitante: row.nomeSolicitante,
      diasRestantes: row.diasRestantes,
    };
  }
}
