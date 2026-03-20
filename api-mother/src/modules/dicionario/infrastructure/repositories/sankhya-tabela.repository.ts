import { Injectable } from '@nestjs/common';
import {
  IRepositorioTabela,
  PaginacaoParametros,
  ResultadoPaginado,
} from '../../domain/repositories/tabela.repository.interface';
import { Tabela } from '../../domain/entities/tabela.entity';
import { TabelaMapper, TabelaCru } from '../../application/mappers/tabela.mapper';
import { SqlServerService } from '../../../../database/sqlserver.service';

@Injectable()
export class SankhyaTabelaRepository implements IRepositorioTabela {
  constructor(
    private readonly sqlServer: SqlServerService,
    private readonly mapper: TabelaMapper,
  ) {}

  async buscarPorNome(nomeTabela: string, _tokenUsuario: string): Promise<Tabela | null> {
    const sql = `
      SELECT NOMETAB, DESCRICAO, NOMEINSTANCIA, MODULO, ATIVA, TIPOCRUD
      FROM TDDTAB
      WHERE NOMETAB = @param1
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeTabela]);
    if (!resultado || resultado.length === 0) return null;
    return this.mapper.paraDominio(resultado[0] as TabelaCru);
  }

  async buscarTodas(_tokenUsuario: string): Promise<Tabela[]> {
    const sql = `
      SELECT NOMETAB, DESCRICAO, NOMEINSTANCIA, MODULO, ATIVA, TIPOCRUD
      FROM TDDTAB
      ORDER BY NOMETAB
    `;
    const resultado = await this.sqlServer.executeSQL(sql, []);
    return (resultado as TabelaCru[]).map((r) => this.mapper.paraDominio(r));
  }

  async buscarAtivas(_tokenUsuario: string): Promise<Tabela[]> {
    const sql = `
      SELECT NOMETAB, DESCRICAO, NOMEINSTANCIA, MODULO, ATIVA, TIPOCRUD
      FROM TDDTAB
      WHERE ATIVA = 'S'
      ORDER BY NOMETAB
    `;
    const resultado = await this.sqlServer.executeSQL(sql, []);
    return (resultado as TabelaCru[]).map((r) => this.mapper.paraDominio(r));
  }

  async buscarPorModulo(modulo: string, _tokenUsuario: string): Promise<Tabela[]> {
    const sql = `
      SELECT NOMETAB, DESCRICAO, NOMEINSTANCIA, MODULO, ATIVA, TIPOCRUD
      FROM TDDTAB
      WHERE MODULO = @param1
      ORDER BY NOMETAB
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [modulo]);
    return (resultado as TabelaCru[]).map((r) => this.mapper.paraDominio(r));
  }

  async existeTabela(nomeTabela: string, _tokenUsuario: string): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as total FROM TDDTAB WHERE NOMETAB = @param1
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeTabela]);
    return resultado[0]?.total > 0;
  }

  async buscarAtivasPaginado(
    paginacao: PaginacaoParametros,
    _tokenUsuario: string,
  ): Promise<ResultadoPaginado<Tabela>> {
    const offset = (paginacao.page - 1) * paginacao.limit;

    // Contar total
    const sqlTotal = `
      SELECT COUNT(*) as total
      FROM TDDTAB
      WHERE ATIVA = 'S'
    `;
    const resultadoTotal = await this.sqlServer.executeSQL(sqlTotal, []);
    const total = resultadoTotal[0]?.total || 0;

    // Buscar página
    const sql = `
      SELECT NOMETAB, DESCRICAO, NOMEINSTANCIA, MODULO, ATIVA, TIPOCRUD
      FROM TDDTAB
      WHERE ATIVA = 'S'
      ORDER BY NOMETAB
      OFFSET @param1 ROWS FETCH NEXT @param2 ROWS ONLY
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [offset, paginacao.limit]);
    const dados = (resultado as TabelaCru[]).map((r) => this.mapper.paraDominio(r));

    return {
      dados,
      total,
      page: paginacao.page,
      limit: paginacao.limit,
      totalPages: Math.ceil(total / paginacao.limit),
    };
  }

  async buscarPorTermo(termo: string, _tokenUsuario: string): Promise<Tabela[]> {
    const termoLike = `%${termo.toUpperCase()}%`;
    const sql = `
      SELECT NOMETAB, DESCRICAO, NOMEINSTANCIA, MODULO, ATIVA, TIPOCRUD
      FROM TDDTAB
      WHERE ATIVA = 'S'
        AND (UPPER(NOMETAB) LIKE @param1 OR UPPER(DESCRICAO) LIKE @param1)
      ORDER BY NOMETAB
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [termoLike]);
    return (resultado as TabelaCru[]).map((r) => this.mapper.paraDominio(r));
  }
}
