import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { PublicQueryExecutor } from '../../infra/api-mother/publicQueryExecutor';
import {
  ArmarioFuncionario,
  ArmarioPublicoRow,
  ArmarioPublicoSeguro,
  ArmarioListItem,
  ArmarioLocal,
} from '../../types/AD_ARMARIO';
import { FuncionariosService } from './funcionarios.service';
import { logger } from '../../shared/logger';
import * as Q from '../../sql-queries/AD_ARMARIO';
import { escapeSqlString, escapeSqlLike } from '../../shared/sql-sanitize';

export interface ListarArmariosParams {
  page?: number;
  limit?: number;
  localArm?: number;
  ocupado?: boolean;
  departamento?: string;
  termo?: string;
  orderBy?: 'codarmario' | 'nuarmario' | 'localDescricao' | 'nomeFuncionario' | 'tagArmario';
  orderDir?: 'ASC' | 'DESC';
}

export interface ListarArmariosResult {
  data: ArmarioListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CountRow {
  total: number;
}

export class ArmarioService {
  private queryExecutor: QueryExecutor;
  private publicQueryExecutor: PublicQueryExecutor;
  private funcionariosService: FuncionariosService;

  constructor() {
    this.queryExecutor = new QueryExecutor();
    this.publicQueryExecutor = new PublicQueryExecutor();
    this.funcionariosService = new FuncionariosService();
  }

  async listar(params: ListarArmariosParams): Promise<ListarArmariosResult> {
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
      data: rows,
      meta: { total, page, limit, totalPages },
    };
  }

  async listarTodos(params: ListarArmariosParams): Promise<ArmarioListItem[]> {
    const orderBy = this.buildOrderBy(params.orderBy, params.orderDir);
    const whereClause = this.buildWhereClause(params);

    const sql = Q.listarArmariosTodos
      .replace(/@orderBy/g, orderBy)
      .replace(/@whereClause/g, whereClause);

    return this.queryExecutor.executeQuery<ArmarioListItem>(sql);
  }

  async getByFuncionario(
    codemp: number,
    codfunc: number,
  ): Promise<ArmarioFuncionario | null> {
    const sql = Q.getByFuncionario
      .replace(/@CODEMP/g, codemp.toString())
      .replace(/@CODFUNC/g, codfunc.toString());

    const rows = await this.queryExecutor.executeQuery<ArmarioFuncionario>(sql);
    return rows[0] ?? null;
  }

  async listarLocais(): Promise<ArmarioLocal[]> {
    return this.queryExecutor.executeQuery<ArmarioLocal>(Q.listarLocais);
  }

  async getPublico(codarmario: number): Promise<ArmarioPublicoSeguro | null> {
    const sql = Q.getPublico
      .replace(/@CODARMARIO/g, codarmario.toString());

    const rows = await this.publicQueryExecutor.executeQuery<ArmarioPublicoRow>(sql);
    const row = rows[0];
    if (!row) return null;

    const ocupado = !!row.ocupado;
    let funcionario: ArmarioPublicoSeguro['funcionario'] = null;

    if (ocupado && row.nomeFuncionario) {
      let fotoBase64: string | null = null;
      if (row._codparcInterno > 0) {
        try {
          fotoBase64 = await this.getFotoPublica(row._codparcInterno);
        } catch (err) {
          logger.warn('[Armario] Foto fetch failed for codparc=%d: %s',
            row._codparcInterno, err instanceof Error ? err.message : String(err));
        }
      }
      funcionario = {
        nome: row.nomeFuncionario,
        departamento: row.departamento,
        empresa: row.empresa,
        fotoBase64,
      };
    }

    return {
      codarmario: row.codarmario,
      nuarmario: row.nuarmario,
      tagArmario: row.tagArmario,
      localDescricao: row.localDescricao,
      ocupado,
      funcionario,
    };
  }

  private async getFotoPublica(codparc: number): Promise<string | null> {
    const sql = `SELECT TOP 1 IMAGEM FROM TFPFUN WHERE CODPARC = ${codparc} AND IMAGEM IS NOT NULL`;
    const rows = await this.publicQueryExecutor.executeQuery<{ IMAGEM: unknown }>(sql);
    const row = rows[0];
    if (!row?.IMAGEM) return null;

    let buf: Buffer;
    const img = row.IMAGEM;
    if (Buffer.isBuffer(img)) {
      buf = img;
    } else if (img instanceof Uint8Array || Array.isArray(img)) {
      buf = Buffer.from(img);
    } else if (typeof img === 'object' && img !== null) {
      // API returns blob as { "0": 255, "1": 216, ... }
      const values = Object.keys(img as Record<string, number>)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => (img as Record<string, number>)[k]);
      buf = Buffer.from(values);
    } else if (typeof img === 'string') {
      buf = Buffer.from(img, 'base64');
    } else {
      return null;
    }

    return `data:image/jpeg;base64,${buf.toString('base64')}`;
  }

  private async executeListQuery(
    offset: number,
    limit: number,
    orderBy: string,
    whereClause: string,
  ): Promise<ArmarioListItem[]> {
    const sql = Q.listarArmarios
      .replace(/@offset/g, offset.toString())
      .replace(/@limit/g, limit.toString())
      .replace(/@orderBy/g, orderBy)
      .replace(/@whereClause/g, whereClause);

    return this.queryExecutor.executeQuery<ArmarioListItem>(sql);
  }

  private async executeCountQuery(whereClause: string): Promise<CountRow[]> {
    const sql = Q.contarArmarios.replace(/@whereClause/g, whereClause);
    return this.queryExecutor.executeQuery<CountRow>(sql);
  }

  private buildWhereClause(params: ListarArmariosParams): string {
    const conditions: string[] = [];

    if (params.localArm != null) {
      conditions.push(`AND a.LOCAL_ARM = ${params.localArm}`);
    }
    if (params.ocupado === true) {
      conditions.push(`AND a.CODFUNC IS NOT NULL AND a.CODFUNC > 0`);
    } else if (params.ocupado === false) {
      conditions.push(`AND (a.CODFUNC IS NULL OR a.CODFUNC = 0)`);
    }
    if (params.departamento) {
      const dep = escapeSqlString(params.departamento.substring(0, 100));
      conditions.push(`AND fun.DESCRDEP = '${dep}'`);
    }
    if (params.termo) {
      const sanitized = escapeSqlString(params.termo.substring(0, 100));
      conditions.push(`AND (
        fun.NOMEPARC LIKE '%${sanitized}%'
        OR CAST(a.NUARMARIO AS VARCHAR) = '${sanitized}'
        OR ISNULL(a.NUCADEADO, '') LIKE '%${sanitized}%'
      )`);
    }

    return conditions.join(' ');
  }

  private buildOrderBy(orderBy?: string, orderDir?: string): string {
    const dir = orderDir === 'DESC' ? 'DESC' : 'ASC';
    const columnMap: Record<string, string> = {
      codarmario: 'a.CODARMARIO',
      nuarmario: 'a.NUARMARIO',
      localDescricao: 'a.LOCAL_ARM',
      nomeFuncionario: 'fun.NOMEPARC',
      tagArmario: 'a.LOCAL_ARM, a.NUARMARIO',
    };
    const column = columnMap[orderBy || 'codarmario'] || 'a.CODARMARIO';
    return `${column} ${dir}`;
  }
}
