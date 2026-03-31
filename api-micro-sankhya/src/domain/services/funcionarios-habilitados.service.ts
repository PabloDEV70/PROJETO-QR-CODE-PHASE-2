import path from 'path';
import { promises as fs } from 'fs';
import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { FuncionarioHabilitadoDto } from '../dto/funcionario-habilitado.dto';

export class FuncionariosHabilitadosService {
  private queryExecutor: QueryExecutor;
  private sql: string | null = null;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  private async getSql(): Promise<string> {
    if (this.sql) {
      return this.sql;
    }
    const sqlPath = path.join(
      __dirname,
      '../../sql-queries/funcionarios/find-funcionarios-habilitados.sql'
    );
    this.sql = await fs.readFile(sqlPath, 'utf-8');
    return this.sql;
  }

  async listar(): Promise<FuncionarioHabilitadoDto[]> {
    const sql = await this.getSql();
    const result = await this.queryExecutor.executeQuery<FuncionarioHabilitadoDto>(sql);
    return result;
  }
}
