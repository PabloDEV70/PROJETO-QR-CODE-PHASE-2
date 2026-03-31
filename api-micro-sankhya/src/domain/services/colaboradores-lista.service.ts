import { listarFuncionarios, contarFuncionarios, listarFuncionariosTodos } from '../../sql-queries/TFPFUN/listar-funcionarios';
import { QueryExecutor } from '../../infra/api-mother/queryExecutor';

export class ColaboradoresListaService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async listar(params: { limit?: number; offset?: number, coddep?: number }) {
    const limit = params.limit ?? 25;
    const offset = params.offset ?? 0;

    const whereConditions = ["AND fun.SITUACAO = '1'"];
    if (params.coddep) {
      whereConditions.push(`AND fun.CODDEP = ${params.coddep}`);
    }
    const whereClause = whereConditions.join(' ');
    const orderBy = "nomeparc ASC";

    // Substituição dos placeholders
    const sqlData = listarFuncionarios
      .replace(/@whereClause/g, whereClause)
      .replace(/@orderBy/g, orderBy)
      .replace(/@offset/g, offset.toString())
      .replace(/@limit/g, limit.toString());

    const sqlCount = contarFuncionarios.replace(/@whereClause/g, whereClause);

    try {
      const [data, countResult] = await Promise.all([
        this.queryExecutor.executeQuery<any>(sqlData),
        this.queryExecutor.executeQuery<{ total: number }>(sqlCount)
      ]);

      // Mapeia o resultado para o formato que o frontend espera (propriedades em maiúsculas)
      const formattedData = (data || []).map((row: any) => ({
        CODFUNC: row.codfunc,
        NOMEFUNC: row.nomeparc, // A query usa nomeparc, o frontend espera NOMEFUNC
        CODEMP: row.codemp,
        RAZAOSOCIAL: row.empresa, // A query usa empresa, o frontend espera RAZAOSOCIAL
        DESCRCARGO: row.cargo,
      }));

      return {
        data: formattedData,
        total: (countResult as any)[0]?.total || 0
      };
    } catch (error) {
      console.error('[ColaboradoresListaService] Erro na execução do SQL:', error);
      throw error;
    }
  }

  async listarTodos(params: { coddep?: number }) {
    const whereConditions = ["AND fun.SITUACAO = '1'"];
    if (params.coddep) {
      whereConditions.push(`AND fun.CODDEP = ${params.coddep}`);
    }
    const whereClause = whereConditions.join(' ');
    const orderBy = "nomeparc ASC";

    const sql = listarFuncionariosTodos
      .replace(/@whereClause/g, whereClause)
      .replace(/@orderBy/g, orderBy);

    try {
      const data = await this.queryExecutor.executeQuery<any>(sql);
      return (data || []).map((row: any) => ({
        CODFUNC: row.codfunc,
        NOMEFUNC: row.nomeparc,
        CODEMP: row.codemp,
        RAZAOSOCIAL: row.empresa,
        DESCRCARGO: row.cargo,
      }));
    } catch (error) {
      console.error('[ColaboradoresListaService] Erro na execução do SQL (listarTodos):', error);
      throw error;
    }
  }
}