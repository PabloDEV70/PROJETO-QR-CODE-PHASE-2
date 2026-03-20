import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString } from '../../shared/sql-sanitize';
import { TgfPar, RdoResumo, OsManutencaoResumo } from '../../types/TGFPAR';
import { TgfParPerfilCompleto } from '../../types/TGFPAR/tgf-par-perfil-completo';
import { PerfilInclude } from '../../types/TGFPAR/perfil-include';
import * as Q from '../../sql-queries/TGFPAR';
import { ParceirosDetailService, PaginatedOptions } from './parceiros-detail.service';

export { PaginatedOptions } from './parceiros-detail.service';

export interface ListParceirosOptions {
  page: number;
  limit: number;
  tippessoa?: 'F' | 'J';
  ativo?: 'S' | 'N';
  searchTerm?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  // Filtros por papel
  cliente?: 'S' | 'N';
  fornecedor?: 'S' | 'N';
  funcionario?: 'S' | 'N';
  vendedor?: 'S' | 'N';
  motorista?: 'S' | 'N';
  usuario?: 'S' | 'N';
  comprador?: 'S' | 'N';
}

export class ParceirosService {
  private queryExecutor: QueryExecutor;
  private detailService: ParceirosDetailService;

  constructor() {
    this.queryExecutor = new QueryExecutor();
    this.detailService = new ParceirosDetailService();
  }

  async getById(codparc: number): Promise<TgfPar | null> {
    return this.detailService.getById(codparc);
  }

  async getPerfilCompleto(
    codparc: number,
    includes: PerfilInclude[] = [],
  ): Promise<TgfParPerfilCompleto | null> {
    return this.detailService.getPerfilCompleto(codparc, includes);
  }

  async search(term: string): Promise<TgfPar[]> {
    const sanitized = escapeSqlString(term.substring(0, 100));
    const sanitizedDocument = sanitized.replace(/[.\-\/\s]/g, '');

    const sql = Q.pesquisar
      .replace(/@sanitizedDocument/g, sanitizedDocument)
      .replace(/@sanitized/g, sanitized);

    return this.queryExecutor.executeQuery<TgfPar>(sql);
  }

  async list(options: ListParceirosOptions): Promise<TgfPar[]> {
    const {
      page,
      limit,
      tippessoa,
      ativo,
      searchTerm,
      orderBy = 'NOMEPARC',
      orderDir = 'ASC',
      cliente,
      fornecedor,
      funcionario,
      vendedor,
      motorista,
      usuario,
      comprador,
    } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['parceiros.CODPARC > 0', 'parceiros.CGC_CPF IS NOT NULL'];

    if (tippessoa) {
      conditions.push(`parceiros.TIPPESSOA = '${tippessoa}'`);
    }

    if (ativo) {
      conditions.push(`parceiros.ATIVO = '${ativo}'`);
    } else {
      conditions.push(`parceiros.ATIVO = 'S'`);
    }

    // Filtros por papel direto na TGFPAR
    if (cliente) conditions.push(`parceiros.CLIENTE = '${cliente}'`);
    if (fornecedor) conditions.push(`parceiros.FORNECEDOR = '${fornecedor}'`);
    if (motorista) conditions.push(`parceiros.MOTORISTA = '${motorista}'`);

    // Filtros por relacionamento (funcionario e usuario via JOINs)
    if (funcionario === 'S') {
      conditions.push(`tfp.CODPARC IS NOT NULL`);
    } else if (funcionario === 'N') {
      conditions.push(`tfp.CODPARC IS NULL`);
    }

    if (usuario === 'S') {
      conditions.push(`tsu.CODPARC IS NOT NULL`);
    } else if (usuario === 'N') {
      conditions.push(`tsu.CODPARC IS NULL`);
    }

    // Filtros vendedor e comprador (via TGFVEN)
    if (vendedor === 'S') {
      conditions.push(`vend.CODPARC IS NOT NULL`);
    } else if (vendedor === 'N') {
      conditions.push(`vend.CODPARC IS NULL`);
    }

    if (comprador === 'S') {
      conditions.push(`vend.ATUACOMPRADOR = 'S'`);
    } else if (comprador === 'N') {
      conditions.push(`(vend.ATUACOMPRADOR IS NULL OR vend.ATUACOMPRADOR = 'N')`);
    }

    if (searchTerm && searchTerm.trim().length > 0) {
      const sanitized = escapeSqlString(searchTerm.substring(0, 100));
      const sanitizedDocument = sanitized.replace(/[.\-\/\s]/g, '');
      conditions.push(`(
        parceiros.NOMEPARC LIKE '%${sanitized}%'
        OR REPLACE(REPLACE(REPLACE(REPLACE(parceiros.CGC_CPF, '.', ''), '-', ''), '/', ''), ' ', '') LIKE '%${sanitizedDocument}%'
        OR CAST(parceiros.CODPARC AS VARCHAR) = '${sanitized}'
      )`);
    }

    const whereSql = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    const allowedSorts = ['NOMEPARC', 'CODPARC', 'RAZAOSOCIAL'];
    const safeOrderBy = allowedSorts.includes(orderBy)
      ? `parceiros.${orderBy}`
      : 'parceiros.NOMEPARC';
    const orderSql = `${safeOrderBy} ${orderDir}`;

    const sql = Q.listar
      .replace('-- @WHERE', whereSql)
      .replace('-- @ORDER', orderSql)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    return this.queryExecutor.executeQuery<TgfPar>(sql);
  }

  async getRdos(codparc: number, options: PaginatedOptions): Promise<RdoResumo[]> {
    return this.detailService.getRdos(codparc, options);
  }

  async getOsManutencao(
    codparc: number,
    options: PaginatedOptions,
  ): Promise<OsManutencaoResumo[]> {
    return this.detailService.getOsManutencao(codparc, options);
  }
}
