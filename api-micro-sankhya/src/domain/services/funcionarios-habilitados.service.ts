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
    // Attempt known locations for the SQL file (older path and TREINAMENTOS folder)
    const candidates = [
      path.join(__dirname, '../../sql-queries/funcionarios/find-funcionarios-habilitados.sql'),
      path.join(__dirname, '../../sql-queries/TREINAMENTOS/find-funcionarios-habilitados.sql'),
    ];
    let found: string | null = null;
    for (const p of candidates) {
      try {
        const content = await fs.readFile(p, 'utf-8');
        found = content;
        break;
      } catch {
        // ignore and try next
      }
    }
    if (!found) throw new Error('SQL file find-funcionarios-habilitados.sql not found in expected paths');
    this.sql = found;
    return this.sql;
  }

  async listar(): Promise<FuncionarioHabilitadoDto[]> {
    const sql = await this.getSql();
    const result = await this.queryExecutor.executeQuery<FuncionarioHabilitadoDto>(sql);
    return result.map((r: any) => {
      // Ensure date fields are strings
      const fmt = (v: any) => {
        if (v == null) return '';
        if (typeof v === 'string') return v;
        if (v instanceof Date) return v.toISOString().split('T')[0];
        if (typeof v === 'object') {
          if (typeof v.toISOString === 'function') return v.toISOString().split('T')[0];
          if (typeof v.value === 'string') return v.value.split('T')[0];
          return String(v);
        }
        return String(v);
      };

      return {
        ...r,
        DTEMISSAO: fmt(r.DTEMISSAO ?? r.dtemissao ?? r.dtEmissao),
        DTVALIDADE: fmt(r.DTVALIDADE ?? r.dtvalidade ?? r.dtValidade),
      } as FuncionarioHabilitadoDto;
    });
  }

  async listarPorCodfunc(codfunc: number, codemp?: number): Promise<FuncionarioHabilitadoDto[]> {
    const sql = await this.getSql();
    // insert a filter for specific CODFUNC before ORDER BY
    const idx = sql.toUpperCase().lastIndexOf('ORDER BY');
    let sqlWithFilter: string;
    if (idx >= 0) {
      const before = sql.slice(0, idx);
      const after = sql.slice(idx);
      sqlWithFilter = `${before}\n  AND FUN.CODFUNC = ${Number(codfunc)}\n`;
      if (codemp != null && !Number.isNaN(Number(codemp))) {
        sqlWithFilter += `  AND FUN.CODEMP = ${Number(codemp)}\n`;
      }
      sqlWithFilter += after;
    } else {
      sqlWithFilter = `${sql}\nAND FUN.CODFUNC = ${Number(codfunc)}`;
      if (codemp != null && !Number.isNaN(Number(codemp))) {
        sqlWithFilter += `\nAND FUN.CODEMP = ${Number(codemp)}`;
      }
    }
    const result = await this.queryExecutor.executeQuery<FuncionarioHabilitadoDto>(sqlWithFilter);
    return result.map((r: any) => {
      const fmt = (v: any) => {
        if (v == null) return '';
        if (typeof v === 'string') return v;
        if (v instanceof Date) return v.toISOString().split('T')[0];
        if (typeof v === 'object') {
          if (typeof v.toISOString === 'function') return v.toISOString().split('T')[0];
          if (typeof v.value === 'string') return v.value.split('T')[0];
          return String(v);
        }
        return String(v);
      };

      return {
        ...r,
        DTEMISSAO: fmt(r.DTEMISSAO ?? r.dtemissao ?? r.dtEmissao),
        DTVALIDADE: fmt(r.DTVALIDADE ?? r.dtvalidade ?? r.dtValidade),
      } as FuncionarioHabilitadoDto;
    });
  }
}
